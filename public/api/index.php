<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Health Telemetry Endpoint
if ($uri === '/api/health' || str_ends_with($uri, '/api/health')) {
  echo json_encode([
    'status' => 'ok',
    'environment' => 'production_php',
    'timestamp' => date('Y-m-d H:i:s'),
    'engine' => 'Vanilla Web + PHP 8 Native Server',
    'target_directory' => 'mattstack.xo.je/htdocs/'
  ]);
  exit();
}

// Fallback response for unhandled endpoints
echo json_encode([
  'status' => 'active',
  'message' => 'WebDev Academy PHP 8 Backend Service Operational'
]);
