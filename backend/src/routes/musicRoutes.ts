import { Router } from 'express';
import { MusicController } from '../controllers/musicController.js';
import { optionalAuthenticateToken } from '../middleware/auth.js';

const router = Router();

// Discovery & Streaming
router.get('/home', MusicController.getHomeFeed);
router.get('/offline-pack', MusicController.getOfflinePack);
router.get('/search', MusicController.search);
router.get('/languages', MusicController.getLanguages);
router.get('/languages/:lang', MusicController.getTracksByLanguage);
router.get('/videos/trending', MusicController.getTrendingVideos);
router.get('/videos/search', MusicController.searchVideos);
router.get('/saavn/stream/:id', MusicController.streamSaavnTrack);
router.get('/saavn/trending', MusicController.getJioSaavnTrending);
router.get('/saavn/search', MusicController.searchJioSaavn);
router.get('/spotify/stream/:id', MusicController.streamSpotifyTrack);
router.get('/spotify/trending', MusicController.getSpotifyTopHits);
router.get('/spotify/search', MusicController.searchSpotify);
router.get('/tracks/:id', MusicController.getTrackById);

// Playlists (persisted per authenticated session or demo user)
router.get('/playlists', optionalAuthenticateToken, MusicController.getUserPlaylists);
router.get('/playlists/:id', optionalAuthenticateToken, MusicController.getPlaylistById);
router.post('/playlists', optionalAuthenticateToken, MusicController.createPlaylist);
router.put('/playlists/:id', optionalAuthenticateToken, MusicController.updatePlaylist);
router.delete('/playlists/:id', optionalAuthenticateToken, MusicController.deletePlaylist);
router.post('/playlists/:id/tracks', optionalAuthenticateToken, MusicController.addTrackToPlaylist);
router.delete('/playlists/:id/tracks/:trackId', optionalAuthenticateToken, MusicController.removeTrackFromPlaylist);

// Liked Tracks
router.get('/likes', optionalAuthenticateToken, MusicController.getLikedTracks);
router.post('/likes/toggle', optionalAuthenticateToken, MusicController.toggleLikeTrack);

export default router;

