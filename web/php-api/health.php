<?php
require_once __DIR__.'/lib.php';

$csvUrl = getenv('GOOGLE_SHEETS_CSV_URL');
$env = [
  'GOOGLE_SHEETS_CSV_URL' => $csvUrl ? 'set' : 'missing',
];

$errors = [];
$sample = null;
if ($csvUrl) {
  $csv = fetch_url($csvUrl);
  if ($csv === null) {
    $errors[] = 'CSV fetch failed (check sharing/publish settings and URL)';
  } else {
    $rows = parse_csv_to_rows($csv);
    $sample = array_slice($rows, 0, 3);
  }
}

$items = load_all_products();

http_json([
  'env' => $env,
  'errors' => $errors,
  'items_count' => count($items),
  'items_sample' => array_slice($items, 0, 2),
  'csv_sample' => $sample,
]);
