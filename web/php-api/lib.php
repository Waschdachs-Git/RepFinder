<?php
// Shared helpers for PHP API
// - Reads products from Google Sheets CSV (GOOGLE_SHEETS_CSV_URL) or local JSON fallback ../data/products.generated.json
// - Caches parsed data to ../.cache/products.json for TTL seconds

function ensure_cache_dir() {
  $dir = __DIR__ . '/../.cache';
  if (!is_dir($dir)) { @mkdir($dir, 0775, true); }
  return $dir;
}

function cache_get($key, $ttlSec) {
  $dir = ensure_cache_dir();
  $file = $dir . '/' . $key;
  if (is_file($file)) {
    $age = time() - filemtime($file);
    if ($age <= $ttlSec) {
      $txt = @file_get_contents($file);
      if ($txt !== false) return $txt;
    }
  }
  return null;
}

function cache_set($key, $text) {
  $dir = ensure_cache_dir();
  $file = $dir . '/' . $key;
  @file_put_contents($file, $text);
}

function http_json($payload, $status = 200) {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($payload);
  exit;
}

function fetch_url($url) {
  // Try file_get_contents; fallback to cURL
  $ctx = stream_context_create(['http' => ['timeout' => 10], 'https' => ['timeout' => 10]]);
  $res = @file_get_contents($url, false, $ctx);
  if ($res !== false) return $res;
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_FOLLOWLOCATION=>true, CURLOPT_TIMEOUT=>10]);
    $out = curl_exec($ch);
    curl_close($ch);
    if ($out !== false) return $out;
  }
  return null;
}

function parse_csv_to_rows($csvText) {
  $rows = [];
  $lines = preg_split('/\r\n|\r|\n/', $csvText);
  $headers = null;
  foreach ($lines as $line) {
    if ($line === '') continue;
    $cells = str_getcsv($line);
    if ($headers === null) { $headers = $cells; continue; }
    $row = [];
    foreach ($headers as $i => $h) {
      $key = strtolower(trim($h));
      $row[$key] = isset($cells[$i]) ? trim($cells[$i]) : '';
    }
    $rows[] = $row;
  }
  return $rows;
}

function load_products_raw() {
  $csvUrl = getenv('GOOGLE_SHEETS_CSV_URL');
  if ($csvUrl) {
    $cached = cache_get('products.csv.json', 300);
    if ($cached) return json_decode($cached, true);
    $csv = fetch_url($csvUrl);
    if ($csv) {
      $rows = parse_csv_to_rows($csv);
      cache_set('products.csv.json', json_encode($rows));
      return $rows;
    }
  }
  // Fallback: local generated JSON (relative to public root)
  $local = __DIR__ . '/../public/data/products.generated.json';
  if (!is_file($local)) $local = __DIR__ . '/../out/data/products.generated.json';
  if (is_file($local)) {
    $json = @file_get_contents($local);
    if ($json !== false) return json_decode($json, true);
  }
  return [];
}

function normalize_products($rows) {
  $out = [];
  foreach ($rows as $r) {
    $name = isset($r['name']) ? $r['name'] : (isset($r['Name']) ? $r['Name'] : '');
    if ($name === '') continue;
    $agent = strtolower(isset($r['agent']) ? $r['agent'] : (isset($r['Agent']) ? $r['Agent'] : 'cnfans'));
    $category = strtolower(isset($r['category']) ? $r['category'] : (isset($r['Category']) ? $r['Category'] : 'other-stuff'));
    $price = isset($r['price']) ? floatval(str_replace(',', '.', $r['price'])) : 0;
    $image = isset($r['image']) ? $r['image'] : '';
    $description = isset($r['description']) ? $r['description'] : '';
    $affiliateUrl = isset($r['affiliateurl']) ? $r['affiliateurl'] : (isset($r['affiliate']) ? $r['affiliate'] : (isset($r['link']) ? $r['link'] : ''));
    $id = isset($r['id']) ? $r['id'] : '';
    if ($id === '') {
      $id = preg_replace('/[^a-z0-9-]+/','-', strtolower($name.'-'.$agent));
      $id = trim($id,'-');
    }
    $out[] = [
      'id'=>$id,
      'name'=>$name,
      'agent'=>$agent,
      'category'=>$category,
      'price'=>$price,
      'image'=>$image,
      'description'=>$description,
      'affiliateUrl'=>$affiliateUrl,
    ];
  }
  return $out;
}

function load_all_products() {
  $raw = load_products_raw();
  // If already array of objects (from JSON), return directly
  if ($raw && isset($raw[0]) && is_array($raw[0]) && isset($raw[0]['name'])) return $raw;
  return normalize_products($raw);
}
