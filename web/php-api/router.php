<?php
// Router for PHP built-in server to support /api/products (no .php) during local preview
// Usage: php -S 127.0.0.1:3000 -t out php-api/router.php

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static files if they exist in docroot
$docRoot = getcwd();
$path = realpath($docRoot . $uri);
if ($path && is_file($path)) {
  return false; // let the server handle the file
}

// Route API endpoints to PHP files
if (preg_match('#^/api/products(?:$|[/?])#', $uri)) {
  require __DIR__ . '/products.php';
  return true;
}
if (preg_match('#^/api/suggest(?:$|[/?])#', $uri)) {
  require __DIR__ . '/suggest.php';
  return true;
}
if (preg_match('#^/api/clicks(?:$|[/?])#', $uri)) {
  require __DIR__ . '/clicks.php';
  return true;
}

// Fallback: serve index.html for SPA-style routes
$index = $docRoot . '/index.html';
if (is_file($index)) {
  readfile($index);
  return true;
}

// Default 404
http_response_code(404);
echo "Not Found";
