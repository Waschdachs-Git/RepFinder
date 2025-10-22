<?php
require_once __DIR__.'/lib.php';

$items = load_all_products();

// Filters
$q = isset($_GET['q']) ? strtolower(trim($_GET['q'])) : '';
$agent = isset($_GET['agent']) ? strtolower(trim($_GET['agent'])) : '';
$category = isset($_GET['category']) ? strtolower(trim($_GET['category'])) : '';
$subcategory = isset($_GET['subcategory']) ? strtolower(trim($_GET['subcategory'])) : (isset($_GET['sub']) ? strtolower(trim($_GET['sub'])) : '');
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'popularity';
$page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$pageSize = isset($_GET['pageSize']) ? max(1, min(60, intval($_GET['pageSize']))) : 24;

$list = $items;
if ($agent !== '') $list = array_values(array_filter($list, fn($p)=> (isset($p['agent']) ? $p['agent'] : '') === $agent));
if ($category !== '') $list = array_values(array_filter($list, fn($p)=> (isset($p['category']) ? $p['category'] : '') === $category));
if ($subcategory !== '') $list = array_values(array_filter($list, fn($p)=> strtolower($p['subcategory'] ?? '') === $subcategory));
if ($q !== '') $list = array_values(array_filter($list, fn($p)=> strpos(strtolower($p['name'] ?? ''), $q) !== false));

// Sorting
if ($sort === 'price-asc') usort($list, fn($a,$b)=> ($a['price'] ?? 0) <=> ($b['price'] ?? 0));
elseif ($sort === 'price-desc') usort($list, fn($a,$b)=> ($b['price'] ?? 0) <=> ($a['price'] ?? 0));
elseif ($sort === 'name-asc') usort($list, fn($a,$b)=> strcmp(strtolower($a['name'] ?? ''), strtolower($b['name'] ?? '')));
else { /* popularity not tracked here; keep order */ }

$total = count($list);
$start = ($page - 1) * $pageSize;
$itemsPage = array_slice($list, $start, $pageSize);

http_json(['items'=>$itemsPage, 'total'=>$total, 'page'=>$page, 'pageSize'=>$pageSize]);
