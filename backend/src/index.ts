import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import authRoutes from './routes/authRoutes.js';
import musicRoutes from './routes/musicRoutes.js';

const app = express();

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting (protect OSINT endpoints from abuse)
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Rate limit reached. Please wait a few moments before submitting additional requests.',
  },
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CHILLMODE Music Engine',
    version: '1.0.0',
    capabilities: [
      'Spotify Global Top 50, Viral Charts & Embed Scraper',
      'JioSaavn Direct MP4/AAC High-Fidelity Audio Streaming',
      'YouTube Music Audio Streaming Bridge',
      'Multi-Language Global Catalog (Hindi, Punjabi, Spanish, K-Pop, Japanese, Tamil, French, Arabic, English)',
      'IndexedDB 100% Offline Audio Blob Engine',
      'Custom Cyberpunk UI & Visualizer',
    ],
  });
});

import path from 'path';
import fs from 'fs';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/auth', authRoutes);
app.use('/music', musicRoutes);

// Serve static frontend files if built
const candidateDistPaths = [
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  'C:\\Users\\LAPTOP\\.gemini\\antigravity\\scratch\\nexora\\frontend\\dist',
];

const frontendDist = candidateDistPaths.find(p => fs.existsSync(p));

if (frontendDist) {
  console.log(`📦 Serving static frontend bundle from: ${frontendDist}`);
  app.use(
    express.static(frontendDist, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('sw.js')) {
          res.setHeader('Service-Worker-Allowed', '/');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        } else if (filePath.endsWith('manifest.json')) {
          res.setHeader('Content-Type', 'application/manifest+json');
        }
      },
    })
  );
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 404 handler for standalone API
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} not found.`,
    });
  });
}

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

if (process.env.VERCEL !== '1' && !process.env.NOW_REGION) {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 CHILLMODE Music Engine running on http://localhost:${config.port}`);
    console.log(`📱 Local Network (Mobile): http://192.168.0.118:${config.port}`);
    console.log(`🔐 Mode: ${config.nodeEnv} | Audio: 320kbps High-Fidelity Streaming`);
    console.log(`🎵 Providers: Spotify Charts + JioSaavn MP4 + YouTube Music + Global Catalog`);
    console.log(`💾 Offline: IndexedDB Local Storage Blob Caching`);
    console.log(`=======================================================`);
  });
}

export default app;
