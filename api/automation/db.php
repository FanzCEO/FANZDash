<?php
/**
 * FanzDash Automation Engine - Database Connection
 * Version: 1.0.0
 *
 * Database helper for the automation system.
 * Adjust DSN to your existing setup or read from .env
 */

function get_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    // Load from environment variables or use defaults
    $host = getenv('DB_HOST') ?: 'localhost';
    $db   = getenv('DB_NAME') ?: 'fanz';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASS') ?: '';
    $port = getenv('DB_PORT') ?: '3306';
    $charset = 'utf8mb4';

    $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        error_log("FanzDash Automation DB Error: " . $e->getMessage());
        throw new Exception("Database connection failed");
    }

    return $pdo;
}

/**
 * PostgreSQL alternative connection
 * Uncomment if using PostgreSQL instead of MySQL
 */
/*
function get_db(): PDO {
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $host = getenv('DB_HOST') ?: 'localhost';
    $db   = getenv('DB_NAME') ?: 'fanz';
    $user = getenv('DB_USER') ?: 'postgres';
    $pass = getenv('DB_PASS') ?: '';
    $port = getenv('DB_PORT') ?: '5432';

    $dsn = "pgsql:host=$host;port=$port;dbname=$db";

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];

    try {
        $pdo = new PDO($dsn, $user, $pass, $options);
    } catch (PDOException $e) {
        error_log("FanzDash Automation DB Error: " . $e->getMessage());
        throw new Exception("Database connection failed");
    }

    return $pdo;
}
*/

/**
 * Helper to get current timestamp in MySQL format
 */
function now(): string {
    return date('Y-m-d H:i:s');
}

/**
 * Helper to add seconds to current timestamp
 */
function future_timestamp(int $seconds): string {
    return date('Y-m-d H:i:s', time() + $seconds);
}
