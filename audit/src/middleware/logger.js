export function loggerMiddleware(req, res, next) {
  const timestamp = new Date().toISOString();
  const start = Date.now();
  
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  
  if (Object.keys(req.params).length > 0) {
    console.log('  Params:', req.params);
  }
  
  if (Object.keys(req.query).length > 0) {
    console.log('  Query:', req.query);
  }
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`  Status: ${res.statusCode} - Duration: ${duration}ms`);
  });
  
  next();
}