<?php
// Simple click counter stored in a JSON file near the API.
// For production, consider moving to a database or disable if not needed.

header('Content-Type: application/json; charset=utf-8');

$store = __DIR__ . '/.data-clicks.json';
if (!is_file($store)) { @file_put_contents($store, '{}'); }

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'POST') {
  $input = json_decode(file_get_contents('php://input'), true) ?: [];
  $id = isset($input['id']) ? strval($input['id']) : '';
  if ($id === '') { http_response_code(400); echo json_encode(['ok'=>false, 'reason'=>'bad-request']); exit; }
  $map = json_decode(@file_get_contents($store), true) ?: [];
  $map[$id] = ($map[$id] ?? 0) + 1;
  @file_put_contents($store, json_encode($map));
  echo json_encode(['ok'=>true, 'clicks'=>$map[$id]]); exit;
}

$map = json_decode(@file_get_contents($store), true) ?: [];
echo json_encode(['clicks'=>$map]);
