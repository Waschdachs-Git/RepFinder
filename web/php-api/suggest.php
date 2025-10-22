<?php
require_once __DIR__.'/lib.php';

$q = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
$agent = isset($_GET['agent']) ? strtolower(trim($_GET['agent'])) : '';
if ($q === '') http_json(['items'=>[]]);

$items = load_all_products();
if ($agent !== '') $items = array_values(array_filter($items, fn($p)=> (isset($p['agent']) ? $p['agent'] : '') === $agent));

$matched = [];
foreach ($items as $p) {
  $name = strtolower($p['name'] ?? '');
  if ($name !== '' && strpos($name, $q) !== false) {
    $matched[] = ['id'=>$p['id'] ?? '', 'name'=>$p['name'] ?? ''];
    if (count($matched) >= 8) break;
  }
}
http_json(['items'=>$matched]);
