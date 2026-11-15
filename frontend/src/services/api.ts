const API_BASE = '/api';

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('chillmode_token') || localStorage.getItem('nexora_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    // Auto-cache critical endpoints for offline resiliency
    try {
      if (endpoint.startsWith('/music/home') && data?.success) {
        localStorage.setItem('chillmode_cached_home_feed', JSON.stringify(data));
      } else if (endpoint.startsWith('/music/languages') && data?.success) {
        localStorage.setItem('chillmode_cached_languages', JSON.stringify(data));
      } else if (endpoint.startsWith('/music/playlists') && options.method === undefined && data?.success) {
        localStorage.setItem('chillmode_cached_playlists', JSON.stringify(data));
      } else if (endpoint.startsWith('/music/likes') && options.method === undefined && data?.success) {
        localStorage.setItem('chillmode_cached_likes', JSON.stringify(data));
      }
    } catch {}

    return data as T;
  } catch (err: any) {
    // Graceful offline fallback
    if (!navigator.onLine || err?.name === 'TypeError' || err?.message?.includes('fetch')) {
      if (endpoint.startsWith('/music/home')) {
        const cached = localStorage.getItem('chillmode_cached_home_feed');
        if (cached) {
          try {
            return JSON.parse(cached) as T;
          } catch {}
        }
      } else if (endpoint.startsWith('/music/languages/')) {
        const lang = decodeURIComponent(endpoint.replace('/music/languages/', '').split('?')[0]).toLowerCase();
        const cached = localStorage.getItem('chillmode_cached_home_feed');
        let matched: any[] = [];
        if (cached) {
          try {
            const feed = JSON.parse(cached);
            const allTracks = [
              ...(feed.data?.trending || []),
              ...(feed.data?.newReleases || []),
              ...(feed.data?.jioSaavnTrending || []),
            ];
            matched = allTracks.filter((t: any) => t.language?.toLowerCase() === lang);
          } catch {}
        }
        return { success: true, language: lang, tracks: matched, total: matched.length, isOffline: true } as unknown as T;
      } else if (endpoint.startsWith('/music/languages')) {
        const cached = localStorage.getItem('chillmode_cached_languages');
        if (cached) {
          try {
            return JSON.parse(cached) as T;
          } catch {}
        }
      } else if (endpoint.startsWith('/music/playlists')) {
        const cached = localStorage.getItem('chillmode_cached_playlists');
        if (cached) {
          try {
            return JSON.parse(cached) as T;
          } catch {}
        }
        return { success: true, data: [] } as unknown as T;
      } else if (endpoint.startsWith('/music/likes')) {
        const cached = localStorage.getItem('chillmode_cached_likes');
        if (cached) {
          try {
            return JSON.parse(cached) as T;
          } catch {}
        }
        return { success: true, data: [] } as unknown as T;
      } else if (endpoint.startsWith('/music/search')) {
        return { success: true, tracks: [], total: 0, isOffline: true } as unknown as T;
      }
    }

    throw err;
  }
}

