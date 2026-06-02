-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Apr 01, 2026 at 12:04 PM
-- Server version: 10.4.17-MariaDB
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `weighsoft`
--

-- --------------------------------------------------------

--
-- Table structure for table `axelsetups`
--

CREATE TABLE `axelsetups` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `steering` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `steering_max` int(11) NOT NULL DEFAULT 0,
  `axel_1` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `axel_1_max` int(11) NOT NULL DEFAULT 0,
  `axel_2` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `axel_2_max` int(11) NOT NULL DEFAULT 0,
  `axel_3` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `axel_3_max` int(11) NOT NULL DEFAULT 0,
  `axel_4` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `axel_4_max` int(11) NOT NULL DEFAULT 0,
  `vehicle_max` int(11) NOT NULL DEFAULT 0,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `axelsetups`
--
DELIMITER $$
CREATE TRIGGER `axelsetups_delete_trigger` AFTER DELETE ON `axelsetups` FOR EACH ROW BEGIN
	INSERT INTO `axelsetups_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `axelsetups_insert_trigger` AFTER INSERT ON `axelsetups` FOR EACH ROW BEGIN
	INSERT INTO `axelsetups_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `axelsetups_update_trigger` AFTER UPDATE ON `axelsetups` FOR EACH ROW Begin 
	UPDATE `axelsetups_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `axelsetups_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`steering`, `new`.`steering`), NULLIF(`new`.`steering`, `old`.`steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`steering_max`, `new`.`steering_max`), NULLIF(`new`.`steering_max`, `old`.`steering_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_1`, `new`.`axel_1`), NULLIF(`new`.`axel_1`, `old`.`axel_1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_1_max`, `new`.`axel_1_max`), NULLIF(`new`.`axel_1_max`, `old`.`axel_1_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_2`, `new`.`axel_2`), NULLIF(`new`.`axel_2`, `old`.`axel_2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_2_max`, `new`.`axel_2_max`), NULLIF(`new`.`axel_2_max`, `old`.`axel_2_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_3`, `new`.`axel_3`), NULLIF(`new`.`axel_3`, `old`.`axel_3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_3_max`, `new`.`axel_3_max`), NULLIF(`new`.`axel_3_max`, `old`.`axel_3_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_4`, `new`.`axel_4`), NULLIF(`new`.`axel_4`, `old`.`axel_4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_4_max`, `new`.`axel_4_max`), NULLIF(`new`.`axel_4_max`, `old`.`axel_4_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`vehicle_max`, `new`.`vehicle_max`), NULLIF(`new`.`vehicle_max`, `old`.`vehicle_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `axelsetups_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`steering`, `new`.`steering`), NULLIF(`new`.`steering`, `old`.`steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`steering_max`, `new`.`steering_max`), NULLIF(`new`.`steering_max`, `old`.`steering_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_1`, `new`.`axel_1`), NULLIF(`new`.`axel_1`, `old`.`axel_1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_1_max`, `new`.`axel_1_max`), NULLIF(`new`.`axel_1_max`, `old`.`axel_1_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_2`, `new`.`axel_2`), NULLIF(`new`.`axel_2`, `old`.`axel_2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_2_max`, `new`.`axel_2_max`), NULLIF(`new`.`axel_2_max`, `old`.`axel_2_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_3`, `new`.`axel_3`), NULLIF(`new`.`axel_3`, `old`.`axel_3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_3_max`, `new`.`axel_3_max`), NULLIF(`new`.`axel_3_max`, `old`.`axel_3_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_4`, `new`.`axel_4`), NULLIF(`new`.`axel_4`, `old`.`axel_4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_4_max`, `new`.`axel_4_max`), NULLIF(`new`.`axel_4_max`, `old`.`axel_4_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`vehicle_max`, `new`.`vehicle_max`), NULLIF(`new`.`vehicle_max`, `old`.`vehicle_max`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `axelsetups_tracking`
--

CREATE TABLE `axelsetups_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `axletypes`
--

CREATE TABLE `axletypes` (
  `id` int(10) UNSIGNED NOT NULL,
  `Single_Steering` int(11) NOT NULL DEFAULT 0,
  `Double_Steering` int(11) NOT NULL DEFAULT 0,
  `Triple_Steering` int(11) NOT NULL DEFAULT 0,
  `Single_Non_Steering` int(11) NOT NULL DEFAULT 0,
  `Double_Non_Steering` int(11) NOT NULL DEFAULT 0,
  `Triple_Non_Steering` int(11) NOT NULL DEFAULT 0,
  `Double_Single_Non_Steering` int(11) NOT NULL,
  `Double_Double_Non_Steering` int(11) NOT NULL,
  `Double_Triple_Non_Steering` int(11) NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `Custom_1` int(11) NOT NULL DEFAULT 0,
  `Custom_2` int(11) NOT NULL DEFAULT 0,
  `Custom_3` int(11) NOT NULL DEFAULT 0
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `axletypes`
--
DELIMITER $$
CREATE TRIGGER `axletypes_delete_trigger` AFTER DELETE ON `axletypes` FOR EACH ROW BEGIN
	INSERT INTO `axletypes_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `axletypes_insert_trigger` AFTER INSERT ON `axletypes` FOR EACH ROW BEGIN
	INSERT INTO `axletypes_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `axletypes_update_trigger` AFTER UPDATE ON `axletypes` FOR EACH ROW Begin 
	UPDATE `axletypes_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `axletypes_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`Single_Steering`, `new`.`Single_Steering`), NULLIF(`new`.`Single_Steering`, `old`.`Single_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Steering`, `new`.`Double_Steering`), NULLIF(`new`.`Double_Steering`, `old`.`Double_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Triple_Steering`, `new`.`Triple_Steering`), NULLIF(`new`.`Triple_Steering`, `old`.`Triple_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Single_Non_Steering`, `new`.`Single_Non_Steering`), NULLIF(`new`.`Single_Non_Steering`, `old`.`Single_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Non_Steering`, `new`.`Double_Non_Steering`), NULLIF(`new`.`Double_Non_Steering`, `old`.`Double_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Triple_Non_Steering`, `new`.`Triple_Non_Steering`), NULLIF(`new`.`Triple_Non_Steering`, `old`.`Triple_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Single_Non_Steering`, `new`.`Double_Single_Non_Steering`), NULLIF(`new`.`Double_Single_Non_Steering`, `old`.`Double_Single_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Double_Non_Steering`, `new`.`Double_Double_Non_Steering`), NULLIF(`new`.`Double_Double_Non_Steering`, `old`.`Double_Double_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Triple_Non_Steering`, `new`.`Double_Triple_Non_Steering`), NULLIF(`new`.`Double_Triple_Non_Steering`, `old`.`Double_Triple_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom_1`, `new`.`Custom_1`), NULLIF(`new`.`Custom_1`, `old`.`Custom_1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom_2`, `new`.`Custom_2`), NULLIF(`new`.`Custom_2`, `old`.`Custom_2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom_3`, `new`.`Custom_3`), NULLIF(`new`.`Custom_3`, `old`.`Custom_3`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `axletypes_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`Single_Steering`, `new`.`Single_Steering`), NULLIF(`new`.`Single_Steering`, `old`.`Single_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Steering`, `new`.`Double_Steering`), NULLIF(`new`.`Double_Steering`, `old`.`Double_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Triple_Steering`, `new`.`Triple_Steering`), NULLIF(`new`.`Triple_Steering`, `old`.`Triple_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Single_Non_Steering`, `new`.`Single_Non_Steering`), NULLIF(`new`.`Single_Non_Steering`, `old`.`Single_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Non_Steering`, `new`.`Double_Non_Steering`), NULLIF(`new`.`Double_Non_Steering`, `old`.`Double_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Triple_Non_Steering`, `new`.`Triple_Non_Steering`), NULLIF(`new`.`Triple_Non_Steering`, `old`.`Triple_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Single_Non_Steering`, `new`.`Double_Single_Non_Steering`), NULLIF(`new`.`Double_Single_Non_Steering`, `old`.`Double_Single_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Double_Non_Steering`, `new`.`Double_Double_Non_Steering`), NULLIF(`new`.`Double_Double_Non_Steering`, `old`.`Double_Double_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Double_Triple_Non_Steering`, `new`.`Double_Triple_Non_Steering`), NULLIF(`new`.`Double_Triple_Non_Steering`, `old`.`Double_Triple_Non_Steering`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom_1`, `new`.`Custom_1`), NULLIF(`new`.`Custom_1`, `old`.`Custom_1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom_2`, `new`.`Custom_2`), NULLIF(`new`.`Custom_2`, `old`.`Custom_2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom_3`, `new`.`Custom_3`), NULLIF(`new`.`Custom_3`, `old`.`Custom_3`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `axletypes_tracking`
--

CREATE TABLE `axletypes_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `businesspartners`
--

CREATE TABLE `businesspartners` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `site_id` int(10) NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `vat_nr` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `suburb` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `postal_code` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `businesspartners`
--
DELIMITER $$
CREATE TRIGGER `businesspartners_delete_trigger` AFTER DELETE ON `businesspartners` FOR EACH ROW BEGIN
	INSERT INTO `businesspartners_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `businesspartners_insert_trigger` AFTER INSERT ON `businesspartners` FOR EACH ROW BEGIN
	INSERT INTO `businesspartners_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `businesspartners_update_trigger` AFTER UPDATE ON `businesspartners` FOR EACH ROW Begin 
	UPDATE `businesspartners_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `businesspartners_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`vat_nr`, `new`.`vat_nr`), NULLIF(`new`.`vat_nr`, `old`.`vat_nr`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`street`, `new`.`street`), NULLIF(`new`.`street`, `old`.`street`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`suburb`, `new`.`suburb`), NULLIF(`new`.`suburb`, `old`.`suburb`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`city`, `new`.`city`), NULLIF(`new`.`city`, `old`.`city`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`postal_code`, `new`.`postal_code`), NULLIF(`new`.`postal_code`, `old`.`postal_code`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `businesspartners_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`vat_nr`, `new`.`vat_nr`), NULLIF(`new`.`vat_nr`, `old`.`vat_nr`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`street`, `new`.`street`), NULLIF(`new`.`street`, `old`.`street`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`suburb`, `new`.`suburb`), NULLIF(`new`.`suburb`, `old`.`suburb`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`city`, `new`.`city`), NULLIF(`new`.`city`, `old`.`city`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`postal_code`, `new`.`postal_code`), NULLIF(`new`.`postal_code`, `old`.`postal_code`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `businesspartners_tracking`
--

CREATE TABLE `businesspartners_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `cameras`
--

CREATE TABLE `cameras` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `pn_recog` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `ip_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `camera_active` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weighbridge_id` int(10) UNSIGNED NOT NULL,
  `workstation_id` int(10) UNSIGNED NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `cameras`
--
DELIMITER $$
CREATE TRIGGER `cameras_delete_trigger` AFTER DELETE ON `cameras` FOR EACH ROW BEGIN
	INSERT INTO `cameras_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `cameras_insert_trigger` AFTER INSERT ON `cameras` FOR EACH ROW BEGIN
	INSERT INTO `cameras_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `cameras_update_trigger` AFTER UPDATE ON `cameras` FOR EACH ROW Begin 
	UPDATE `cameras_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `cameras_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pn_recog`, `new`.`pn_recog`), NULLIF(`new`.`pn_recog`, `old`.`pn_recog`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`ip_address`, `new`.`ip_address`), NULLIF(`new`.`ip_address`, `old`.`ip_address`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`camera_active`, `new`.`camera_active`), NULLIF(`new`.`camera_active`, `old`.`camera_active`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `cameras_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pn_recog`, `new`.`pn_recog`), NULLIF(`new`.`pn_recog`, `old`.`pn_recog`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`ip_address`, `new`.`ip_address`), NULLIF(`new`.`ip_address`, `old`.`ip_address`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`camera_active`, `new`.`camera_active`), NULLIF(`new`.`camera_active`, `old`.`camera_active`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `cameras_tracking`
--

CREATE TABLE `cameras_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `registered_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `tel` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `fax` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `registration_number` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `vat_nr` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_person` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `cell` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `street` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `suburb1` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `city1` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `postal_code1` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `po_box` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `suburb2` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `city2` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `postal_code2` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `terms` varchar(4000) COLLATE utf8_unicode_ci DEFAULT NULL,
  `display_custom_logo_img` blob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `companies`
--
DELIMITER $$
CREATE TRIGGER `companies_delete_trigger` AFTER DELETE ON `companies` FOR EACH ROW BEGIN
	INSERT INTO `companies_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `companies_insert_trigger` AFTER INSERT ON `companies` FOR EACH ROW BEGIN
	INSERT INTO `companies_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `companies_update_trigger` AFTER UPDATE ON `companies` FOR EACH ROW Begin 
	UPDATE `companies_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `companies_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`registered_name`, `new`.`registered_name`), NULLIF(`new`.`registered_name`, `old`.`registered_name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`tel`, `new`.`tel`), NULLIF(`new`.`tel`, `old`.`tel`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`fax`, `new`.`fax`), NULLIF(`new`.`fax`, `old`.`fax`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`email`, `new`.`email`), NULLIF(`new`.`email`, `old`.`email`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`registration_number`, `new`.`registration_number`), NULLIF(`new`.`registration_number`, `old`.`registration_number`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`vat_nr`, `new`.`vat_nr`), NULLIF(`new`.`vat_nr`, `old`.`vat_nr`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`contact_person`, `new`.`contact_person`), NULLIF(`new`.`contact_person`, `old`.`contact_person`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`cell`, `new`.`cell`), NULLIF(`new`.`cell`, `old`.`cell`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`street`, `new`.`street`), NULLIF(`new`.`street`, `old`.`street`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`suburb1`, `new`.`suburb1`), NULLIF(`new`.`suburb1`, `old`.`suburb1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`city1`, `new`.`city1`), NULLIF(`new`.`city1`, `old`.`city1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`postal_code1`, `new`.`postal_code1`), NULLIF(`new`.`postal_code1`, `old`.`postal_code1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`po_box`, `new`.`po_box`), NULLIF(`new`.`po_box`, `old`.`po_box`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`suburb2`, `new`.`suburb2`), NULLIF(`new`.`suburb2`, `old`.`suburb2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`city2`, `new`.`city2`), NULLIF(`new`.`city2`, `old`.`city2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`postal_code2`, `new`.`postal_code2`), NULLIF(`new`.`postal_code2`, `old`.`postal_code2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`delete_transaction_flag`, `new`.`delete_transaction_flag`), NULLIF(`new`.`delete_transaction_flag`, `old`.`delete_transaction_flag`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`terms`, `new`.`terms`), NULLIF(`new`.`terms`, `old`.`terms`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `companies_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`registered_name`, `new`.`registered_name`), NULLIF(`new`.`registered_name`, `old`.`registered_name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`tel`, `new`.`tel`), NULLIF(`new`.`tel`, `old`.`tel`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`fax`, `new`.`fax`), NULLIF(`new`.`fax`, `old`.`fax`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`email`, `new`.`email`), NULLIF(`new`.`email`, `old`.`email`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`registration_number`, `new`.`registration_number`), NULLIF(`new`.`registration_number`, `old`.`registration_number`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`vat_nr`, `new`.`vat_nr`), NULLIF(`new`.`vat_nr`, `old`.`vat_nr`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`contact_person`, `new`.`contact_person`), NULLIF(`new`.`contact_person`, `old`.`contact_person`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`cell`, `new`.`cell`), NULLIF(`new`.`cell`, `old`.`cell`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`street`, `new`.`street`), NULLIF(`new`.`street`, `old`.`street`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`suburb1`, `new`.`suburb1`), NULLIF(`new`.`suburb1`, `old`.`suburb1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`city1`, `new`.`city1`), NULLIF(`new`.`city1`, `old`.`city1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`postal_code1`, `new`.`postal_code1`), NULLIF(`new`.`postal_code1`, `old`.`postal_code1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`po_box`, `new`.`po_box`), NULLIF(`new`.`po_box`, `old`.`po_box`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`suburb2`, `new`.`suburb2`), NULLIF(`new`.`suburb2`, `old`.`suburb2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`city2`, `new`.`city2`), NULLIF(`new`.`city2`, `old`.`city2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`postal_code2`, `new`.`postal_code2`), NULLIF(`new`.`postal_code2`, `old`.`postal_code2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`delete_transaction_flag`, `new`.`delete_transaction_flag`), NULLIF(`new`.`delete_transaction_flag`, `old`.`delete_transaction_flag`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`terms`, `new`.`terms`), NULLIF(`new`.`terms`, `old`.`terms`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `companies_tracking`
--

CREATE TABLE `companies_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `contracts`
--

CREATE TABLE `contracts` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `businesspartner_id` int(11) NOT NULL,
  `expiry_date` datetime NOT NULL,
  `direction` varchar(255) NOT NULL,
  `price` decimal(10,4) DEFAULT NULL,
  `amount` varchar(255) NOT NULL,
  `product_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `company_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `linked_contact_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Triggers `contracts`
--
DELIMITER $$
CREATE TRIGGER `contracts_delete_trigger` AFTER DELETE ON `contracts` FOR EACH ROW BEGIN
	INSERT INTO `contracts_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `contracts_insert_trigger` AFTER INSERT ON `contracts` FOR EACH ROW BEGIN
	INSERT INTO `contracts_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `contracts_update_trigger` AFTER UPDATE ON `contracts` FOR EACH ROW Begin 
	UPDATE `contracts_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `contracts_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`businesspartner_id`, `new`.`businesspartner_id`), NULLIF(`new`.`businesspartner_id`, `old`.`businesspartner_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`expiry_date`, `new`.`expiry_date`), NULLIF(`new`.`expiry_date`, `old`.`expiry_date`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`direction`, `new`.`direction`), NULLIF(`new`.`direction`, `old`.`direction`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`price`, `new`.`price`), NULLIF(`new`.`price`, `old`.`price`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`amount`, `new`.`amount`), NULLIF(`new`.`amount`, `old`.`amount`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`product_id`, `new`.`product_id`), NULLIF(`new`.`product_id`, `old`.`product_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`reason`, `new`.`reason`), NULLIF(`new`.`reason`, `old`.`reason`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`linked_contact_id`, `new`.`linked_contact_id`), NULLIF(`new`.`linked_contact_id`, `old`.`linked_contact_id`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `contracts_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`businesspartner_id`, `new`.`businesspartner_id`), NULLIF(`new`.`businesspartner_id`, `old`.`businesspartner_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`expiry_date`, `new`.`expiry_date`), NULLIF(`new`.`expiry_date`, `old`.`expiry_date`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`direction`, `new`.`direction`), NULLIF(`new`.`direction`, `old`.`direction`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`price`, `new`.`price`), NULLIF(`new`.`price`, `old`.`price`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`amount`, `new`.`amount`), NULLIF(`new`.`amount`, `old`.`amount`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`product_id`, `new`.`product_id`), NULLIF(`new`.`product_id`, `old`.`product_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`reason`, `new`.`reason`), NULLIF(`new`.`reason`, `old`.`reason`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`linked_contact_id`, `new`.`linked_contact_id`), NULLIF(`new`.`linked_contact_id`, `old`.`linked_contact_id`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `contracts_tracking`
--

CREATE TABLE `contracts_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `contract_transactions`
--

CREATE TABLE `contract_transactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `contract_id` int(11) NOT NULL,
  `amount` double(11,2) NOT NULL,
  `weighing_header_id` binary(16) DEFAULT NULL,
  `site_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `company_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Triggers `contract_transactions`
--
DELIMITER $$
CREATE TRIGGER `contract_transactions_delete_trigger` AFTER DELETE ON `contract_transactions` FOR EACH ROW BEGIN
	INSERT INTO `contract_transactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `contract_transactions_insert_trigger` AFTER INSERT ON `contract_transactions` FOR EACH ROW BEGIN
	INSERT INTO `contract_transactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `contract_transactions_update_trigger` AFTER UPDATE ON `contract_transactions` FOR EACH ROW Begin 
	UPDATE `contract_transactions_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `contract_transactions_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`contract_id`, `new`.`contract_id`), NULLIF(`new`.`contract_id`, `old`.`contract_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`amount`, `new`.`amount`), NULLIF(`new`.`amount`, `old`.`amount`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_header_id`, `new`.`weighing_header_id`), NULLIF(`new`.`weighing_header_id`, `old`.`weighing_header_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `contract_transactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`contract_id`, `new`.`contract_id`), NULLIF(`new`.`contract_id`, `old`.`contract_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`amount`, `new`.`amount`), NULLIF(`new`.`amount`, `old`.`amount`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_header_id`, `new`.`weighing_header_id`), NULLIF(`new`.`weighing_header_id`, `old`.`weighing_header_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `contract_transactions_tracking`
--

CREATE TABLE `contract_transactions_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `errorlog`
--

CREATE TABLE `errorlog` (
  `id` int(11) NOT NULL,
  `code` varchar(255) COLLATE utf8_bin NOT NULL,
  `description` varchar(2000) COLLATE utf8_bin NOT NULL,
  `jsondata` varchar(2000) COLLATE utf8_bin NOT NULL,
  `comment` varchar(255) COLLATE utf8_bin NOT NULL,
  `weighbridge_id` int(11) NOT NULL,
  `workstation_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Triggers `errorlog`
--
DELIMITER $$
CREATE TRIGGER `errorlog_delete_trigger` AFTER DELETE ON `errorlog` FOR EACH ROW BEGIN
	INSERT INTO `errorlog_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `errorlog_insert_trigger` AFTER INSERT ON `errorlog` FOR EACH ROW BEGIN
	INSERT INTO `errorlog_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `errorlog_update_trigger` AFTER UPDATE ON `errorlog` FOR EACH ROW Begin 
	UPDATE `errorlog_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `errorlog_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`description`, `new`.`description`), NULLIF(`new`.`description`, `old`.`description`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`jsondata`, `new`.`jsondata`), NULLIF(`new`.`jsondata`, `old`.`jsondata`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`comment`, `new`.`comment`), NULLIF(`new`.`comment`, `old`.`comment`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `errorlog_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`description`, `new`.`description`), NULLIF(`new`.`description`, `old`.`description`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`jsondata`, `new`.`jsondata`), NULLIF(`new`.`jsondata`, `old`.`jsondata`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`comment`, `new`.`comment`), NULLIF(`new`.`comment`, `old`.`comment`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `errorlog_tracking`
--

CREATE TABLE `errorlog_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `exceptions`
--

CREATE TABLE `exceptions` (
  `id` int(11) NOT NULL,
  `code` varchar(255) COLLATE utf8_bin NOT NULL,
  `description` varchar(2000) COLLATE utf8_bin NOT NULL,
  `jsondata` varchar(2000) COLLATE utf8_bin NOT NULL,
  `comment` varchar(255) COLLATE utf8_bin NOT NULL,
  `weighbridge_id` int(11) NOT NULL,
  `workstation_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Triggers `exceptions`
--
DELIMITER $$
CREATE TRIGGER `exceptions_delete_trigger` AFTER DELETE ON `exceptions` FOR EACH ROW BEGIN
	INSERT INTO `exceptions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `exceptions_insert_trigger` AFTER INSERT ON `exceptions` FOR EACH ROW BEGIN
	INSERT INTO `exceptions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `exceptions_update_trigger` AFTER UPDATE ON `exceptions` FOR EACH ROW Begin 
	UPDATE `exceptions_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `exceptions_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`description`, `new`.`description`), NULLIF(`new`.`description`, `old`.`description`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`jsondata`, `new`.`jsondata`), NULLIF(`new`.`jsondata`, `old`.`jsondata`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`comment`, `new`.`comment`), NULLIF(`new`.`comment`, `old`.`comment`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `exceptions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`description`, `new`.`description`), NULLIF(`new`.`description`, `old`.`description`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`jsondata`, `new`.`jsondata`), NULLIF(`new`.`jsondata`, `old`.`jsondata`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`comment`, `new`.`comment`), NULLIF(`new`.`comment`, `old`.`comment`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `exceptions_tracking`
--

CREATE TABLE `exceptions_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `grades`
--
DELIMITER $$
CREATE TRIGGER `grades_delete_trigger` AFTER DELETE ON `grades` FOR EACH ROW BEGIN
	INSERT INTO `grades_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `grades_insert_trigger` AFTER INSERT ON `grades` FOR EACH ROW BEGIN
	INSERT INTO `grades_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `grades_update_trigger` AFTER UPDATE ON `grades` FOR EACH ROW Begin 
	UPDATE `grades_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `grades_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `grades_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `grades_tracking`
--

CREATE TABLE `grades_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `hauliers`
--

CREATE TABLE `hauliers` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `site_id` int(10) NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `hauliers`
--
DELIMITER $$
CREATE TRIGGER `hauliers_delete_trigger` AFTER DELETE ON `hauliers` FOR EACH ROW BEGIN
	INSERT INTO `hauliers_tracking` (
		`id`
		,`site_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,old.`site_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `hauliers_insert_trigger` AFTER INSERT ON `hauliers` FOR EACH ROW BEGIN
	INSERT INTO `hauliers_tracking` (
		`id`
		,`site_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,new.`site_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `hauliers_update_trigger` AFTER UPDATE ON `hauliers` FOR EACH ROW Begin 
	UPDATE `hauliers_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `hauliers_tracking`.`id` = new.`id` AND `hauliers_tracking`.`site_id` = new.`site_id`
	 AND (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `hauliers_tracking` (
		`id`
		,`site_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,new.`site_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `hauliers_tracking`
--

CREATE TABLE `hauliers_tracking` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `migration` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pallets`
--

CREATE TABLE `pallets` (
  `pallet_id` int(10) UNSIGNED NOT NULL,
  `pallet_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `company_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `pallets`
--
DELIMITER $$
CREATE TRIGGER `pallets_delete_trigger` AFTER DELETE ON `pallets` FOR EACH ROW BEGIN
	INSERT INTO `pallets_tracking` (
		`pallet_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`pallet_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `pallets_insert_trigger` AFTER INSERT ON `pallets` FOR EACH ROW BEGIN
	INSERT INTO `pallets_tracking` (
		`pallet_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`pallet_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `pallets_update_trigger` AFTER UPDATE ON `pallets` FOR EACH ROW Begin 
	UPDATE `pallets_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `pallets_tracking`.`pallet_id` = new.`pallet_id`
	 AND (
	    IFNULL(NULLIF(`old`.`pallet_name`, `new`.`pallet_name`), NULLIF(`new`.`pallet_name`, `old`.`pallet_name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`amount`, `new`.`amount`), NULLIF(`new`.`amount`, `old`.`amount`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `pallets_tracking` (
		`pallet_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`pallet_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`pallet_name`, `new`.`pallet_name`), NULLIF(`new`.`pallet_name`, `old`.`pallet_name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`amount`, `new`.`amount`), NULLIF(`new`.`amount`, `old`.`amount`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `pallets_tracking`
--

CREATE TABLE `pallets_tracking` (
  `pallet_id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `vat` decimal(11,2) DEFAULT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  `grades_enabled` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `grades` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `products`
--
DELIMITER $$
CREATE TRIGGER `products_delete_trigger` AFTER DELETE ON `products` FOR EACH ROW BEGIN
	INSERT INTO `products_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `products_insert_trigger` AFTER INSERT ON `products` FOR EACH ROW BEGIN
	INSERT INTO `products_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `products_update_trigger` AFTER UPDATE ON `products` FOR EACH ROW Begin 
	UPDATE `products_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `products_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`vat`, `new`.`vat`), NULLIF(`new`.`vat`, `old`.`vat`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`purchase_price`, `new`.`purchase_price`), NULLIF(`new`.`purchase_price`, `old`.`purchase_price`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`sale_price`, `new`.`sale_price`), NULLIF(`new`.`sale_price`, `old`.`sale_price`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `products_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`vat`, `new`.`vat`), NULLIF(`new`.`vat`, `old`.`vat`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`purchase_price`, `new`.`purchase_price`), NULLIF(`new`.`purchase_price`, `old`.`purchase_price`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`sale_price`, `new`.`sale_price`), NULLIF(`new`.`sale_price`, `old`.`sale_price`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `products_tracking`
--

CREATE TABLE `products_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `reporting`
--

CREATE TABLE `reporting` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `jsondata` varchar(4000) DEFAULT NULL,
  `company_id` varchar(255) DEFAULT NULL,
  `updated_at` varchar(255) DEFAULT NULL,
  `created_at` varchar(255) DEFAULT NULL,
  `deleted_at` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `schedule` varchar(20) DEFAULT NULL,
  `last_report_on` datetime DEFAULT NULL,
  `show_deleted` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Triggers `reporting`
--
DELIMITER $$
CREATE TRIGGER `reporting_delete_trigger` AFTER DELETE ON `reporting` FOR EACH ROW BEGIN
	INSERT INTO `reporting_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `reporting_insert_trigger` AFTER INSERT ON `reporting` FOR EACH ROW BEGIN
	INSERT INTO `reporting_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `reporting_update_trigger` AFTER UPDATE ON `reporting` FOR EACH ROW Begin 
	UPDATE `reporting_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `reporting_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`description`, `new`.`description`), NULLIF(`new`.`description`, `old`.`description`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`jsondata`, `new`.`jsondata`), NULLIF(`new`.`jsondata`, `old`.`jsondata`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`email`, `new`.`email`), NULLIF(`new`.`email`, `old`.`email`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`schedule`, `new`.`schedule`), NULLIF(`new`.`schedule`, `old`.`schedule`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`last_report_on`, `new`.`last_report_on`), NULLIF(`new`.`last_report_on`, `old`.`last_report_on`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `reporting_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`description`, `new`.`description`), NULLIF(`new`.`description`, `old`.`description`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`jsondata`, `new`.`jsondata`), NULLIF(`new`.`jsondata`, `old`.`jsondata`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`email`, `new`.`email`), NULLIF(`new`.`email`, `old`.`email`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`schedule`, `new`.`schedule`), NULLIF(`new`.`schedule`, `old`.`schedule`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`last_report_on`, `new`.`last_report_on`), NULLIF(`new`.`last_report_on`, `old`.`last_report_on`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `reporting_tracking`
--

CREATE TABLE `reporting_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `rfid_vehicles`
--

CREATE TABLE `rfid_vehicles` (
  `id` int(10) UNSIGNED NOT NULL,
  `registration_number` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `rfid` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `rfid_vehicles`
--
DELIMITER $$
CREATE TRIGGER `rfid_vehicles_delete_trigger` AFTER DELETE ON `rfid_vehicles` FOR EACH ROW BEGIN
	INSERT INTO `rfid_vehicles_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `rfid_vehicles_insert_trigger` AFTER INSERT ON `rfid_vehicles` FOR EACH ROW BEGIN
	INSERT INTO `rfid_vehicles_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `rfid_vehicles_update_trigger` AFTER UPDATE ON `rfid_vehicles` FOR EACH ROW Begin 
	UPDATE `rfid_vehicles_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `rfid_vehicles_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`registration_number`, `new`.`registration_number`), NULLIF(`new`.`registration_number`, `old`.`registration_number`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`rfid`, `new`.`rfid`), NULLIF(`new`.`rfid`, `old`.`rfid`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `rfid_vehicles_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`registration_number`, `new`.`registration_number`), NULLIF(`new`.`registration_number`, `old`.`registration_number`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`rfid`, `new`.`rfid`), NULLIF(`new`.`rfid`, `old`.`rfid`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `rfid_vehicles_tracking`
--

CREATE TABLE `rfid_vehicles_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `scope_info`
--

CREATE TABLE `scope_info` (
  `sync_scope_id` varchar(36) NOT NULL,
  `sync_scope_name` varchar(100) NOT NULL,
  `sync_scope_schema` longtext DEFAULT NULL,
  `sync_scope_setup` longtext DEFAULT NULL,
  `sync_scope_version` varchar(10) DEFAULT NULL,
  `scope_last_sync` datetime DEFAULT NULL,
  `scope_last_server_sync_timestamp` bigint(20) DEFAULT NULL,
  `scope_last_sync_timestamp` bigint(20) DEFAULT NULL,
  `scope_last_sync_duration` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `haulier` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `stored_tares` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `numberplate_1` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `numberplate_recognition` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `numberplate_2` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `numberplate_3` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `business_partner` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `use_product_list` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `type_of_weighing` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0.00',
  `first_can_axel` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `second_can_axel` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '0.00',
  `goods_type` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `print_ticket` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT '',
  `reprint` varchar(255) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'text',
  `custom_fields` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input1` text COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_name1` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val1` blob DEFAULT NULL,
  `user_defined_rep1` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input2` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `user_defined_name2` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val2` blob NOT NULL,
  `user_defined_rep2` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input3` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `user_defined_name3` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val3` blob NOT NULL,
  `user_defined_rep3` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input4` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `user_defined_name4` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val4` blob NOT NULL,
  `user_defined_rep4` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input5` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `user_defined_name5` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val5` blob NOT NULL,
  `user_defined_rep5` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input6` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `user_defined_name6` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val6` blob NOT NULL,
  `user_defined_rep6` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input7` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `user_defined_name7` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val7` blob NOT NULL,
  `user_defined_rep7` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input8` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `user_defined_name8` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val8` blob NOT NULL,
  `user_defined_rep8` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input9` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `user_defined_name9` varchar(255) COLLATE utf8_unicode_ci DEFAULT '',
  `user_defined_val9` blob NOT NULL,
  `user_defined_rep9` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `user_defined_input10` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name10` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val10` blob NOT NULL,
  `user_defined_rep10` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `AS_400_path` text COLLATE utf8_unicode_ci NOT NULL,
  `export_AS400` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `silo_verification` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `use_cameras` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `display_cameras` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `print_cameras_on_ticket` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `ticket_header` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `display_custom_header_img` blob DEFAULT NULL,
  `ticket_footer` blob NOT NULL,
  `display_custom_footer_img` blob DEFAULT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `user_defined_input11` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name11` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val11` blob DEFAULT NULL,
  `user_defined_rep11` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input12` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name12` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val12` blob DEFAULT NULL,
  `user_defined_rep12` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input13` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name13` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val13` blob DEFAULT NULL,
  `user_defined_rep13` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input14` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name14` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val14` blob DEFAULT NULL,
  `user_defined_rep14` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input15` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name15` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val15` blob DEFAULT NULL,
  `user_defined_rep15` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input16` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name16` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val16` blob DEFAULT NULL,
  `user_defined_rep16` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input17` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name17` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val17` blob DEFAULT NULL,
  `user_defined_rep17` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input18` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name18` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val18` blob DEFAULT NULL,
  `user_defined_rep18` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input19` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name19` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val19` blob DEFAULT NULL,
  `user_defined_rep19` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_input20` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_name20` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_defined_val20` blob DEFAULT NULL,
  `user_defined_rep20` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `2nd_weighing` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `invoice_enabled` varchar(25) COLLATE utf8_unicode_ci DEFAULT 'false',
  `contract_enabled` varchar(25) COLLATE utf8_unicode_ci DEFAULT 'false',
  `moisture_deduction_level` decimal(8,2) DEFAULT 0.00,
  `prefix` varchar(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `enable_moisture` char(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `enable_handling` char(10) COLLATE utf8_unicode_ci NOT NULL DEFAULT 'false',
  `pallet_enabled` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `tares_enabled` varchar(255) COLLATE utf8_unicode_ci DEFAULT 'false',
  `site_id` int(10) UNSIGNED NOT NULL,
  `workstation_id` int(10) UNSIGNED NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `settings`
--
DELIMITER $$
CREATE TRIGGER `settings_delete_trigger` AFTER DELETE ON `settings` FOR EACH ROW BEGIN
	INSERT INTO `settings_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `settings_insert_trigger` AFTER INSERT ON `settings` FOR EACH ROW BEGIN
	INSERT INTO `settings_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `settings_update_trigger` AFTER UPDATE ON `settings` FOR EACH ROW Begin 
	UPDATE `settings_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `settings_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`haulier`, `new`.`haulier`), NULLIF(`new`.`haulier`, `old`.`haulier`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`stored_tares`, `new`.`stored_tares`), NULLIF(`new`.`stored_tares`, `old`.`stored_tares`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`numberplate_1`, `new`.`numberplate_1`), NULLIF(`new`.`numberplate_1`, `old`.`numberplate_1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`numberplate_recognition`, `new`.`numberplate_recognition`), NULLIF(`new`.`numberplate_recognition`, `old`.`numberplate_recognition`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`numberplate_2`, `new`.`numberplate_2`), NULLIF(`new`.`numberplate_2`, `old`.`numberplate_2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`numberplate_3`, `new`.`numberplate_3`), NULLIF(`new`.`numberplate_3`, `old`.`numberplate_3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`business_partner`, `new`.`business_partner`), NULLIF(`new`.`business_partner`, `old`.`business_partner`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`use_product_list`, `new`.`use_product_list`), NULLIF(`new`.`use_product_list`, `old`.`use_product_list`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`type_of_weighing`, `new`.`type_of_weighing`), NULLIF(`new`.`type_of_weighing`, `old`.`type_of_weighing`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`first_can_axel`, `new`.`first_can_axel`), NULLIF(`new`.`first_can_axel`, `old`.`first_can_axel`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`second_can_axel`, `new`.`second_can_axel`), NULLIF(`new`.`second_can_axel`, `old`.`second_can_axel`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`goods_type`, `new`.`goods_type`), NULLIF(`new`.`goods_type`, `old`.`goods_type`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`print_ticket`, `new`.`print_ticket`), NULLIF(`new`.`print_ticket`, `old`.`print_ticket`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`reprint`, `new`.`reprint`), NULLIF(`new`.`reprint`, `old`.`reprint`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`custom_fields`, `new`.`custom_fields`), NULLIF(`new`.`custom_fields`, `old`.`custom_fields`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input1`, `new`.`user_defined_input1`), NULLIF(`new`.`user_defined_input1`, `old`.`user_defined_input1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name1`, `new`.`user_defined_name1`), NULLIF(`new`.`user_defined_name1`, `old`.`user_defined_name1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val1`, `new`.`user_defined_val1`), NULLIF(`new`.`user_defined_val1`, `old`.`user_defined_val1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep1`, `new`.`user_defined_rep1`), NULLIF(`new`.`user_defined_rep1`, `old`.`user_defined_rep1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input2`, `new`.`user_defined_input2`), NULLIF(`new`.`user_defined_input2`, `old`.`user_defined_input2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name2`, `new`.`user_defined_name2`), NULLIF(`new`.`user_defined_name2`, `old`.`user_defined_name2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val2`, `new`.`user_defined_val2`), NULLIF(`new`.`user_defined_val2`, `old`.`user_defined_val2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep2`, `new`.`user_defined_rep2`), NULLIF(`new`.`user_defined_rep2`, `old`.`user_defined_rep2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input3`, `new`.`user_defined_input3`), NULLIF(`new`.`user_defined_input3`, `old`.`user_defined_input3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name3`, `new`.`user_defined_name3`), NULLIF(`new`.`user_defined_name3`, `old`.`user_defined_name3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val3`, `new`.`user_defined_val3`), NULLIF(`new`.`user_defined_val3`, `old`.`user_defined_val3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep3`, `new`.`user_defined_rep3`), NULLIF(`new`.`user_defined_rep3`, `old`.`user_defined_rep3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input4`, `new`.`user_defined_input4`), NULLIF(`new`.`user_defined_input4`, `old`.`user_defined_input4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name4`, `new`.`user_defined_name4`), NULLIF(`new`.`user_defined_name4`, `old`.`user_defined_name4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val4`, `new`.`user_defined_val4`), NULLIF(`new`.`user_defined_val4`, `old`.`user_defined_val4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep4`, `new`.`user_defined_rep4`), NULLIF(`new`.`user_defined_rep4`, `old`.`user_defined_rep4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input5`, `new`.`user_defined_input5`), NULLIF(`new`.`user_defined_input5`, `old`.`user_defined_input5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name5`, `new`.`user_defined_name5`), NULLIF(`new`.`user_defined_name5`, `old`.`user_defined_name5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val5`, `new`.`user_defined_val5`), NULLIF(`new`.`user_defined_val5`, `old`.`user_defined_val5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep5`, `new`.`user_defined_rep5`), NULLIF(`new`.`user_defined_rep5`, `old`.`user_defined_rep5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input6`, `new`.`user_defined_input6`), NULLIF(`new`.`user_defined_input6`, `old`.`user_defined_input6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name6`, `new`.`user_defined_name6`), NULLIF(`new`.`user_defined_name6`, `old`.`user_defined_name6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val6`, `new`.`user_defined_val6`), NULLIF(`new`.`user_defined_val6`, `old`.`user_defined_val6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep6`, `new`.`user_defined_rep6`), NULLIF(`new`.`user_defined_rep6`, `old`.`user_defined_rep6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input7`, `new`.`user_defined_input7`), NULLIF(`new`.`user_defined_input7`, `old`.`user_defined_input7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name7`, `new`.`user_defined_name7`), NULLIF(`new`.`user_defined_name7`, `old`.`user_defined_name7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val7`, `new`.`user_defined_val7`), NULLIF(`new`.`user_defined_val7`, `old`.`user_defined_val7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep7`, `new`.`user_defined_rep7`), NULLIF(`new`.`user_defined_rep7`, `old`.`user_defined_rep7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input8`, `new`.`user_defined_input8`), NULLIF(`new`.`user_defined_input8`, `old`.`user_defined_input8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name8`, `new`.`user_defined_name8`), NULLIF(`new`.`user_defined_name8`, `old`.`user_defined_name8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val8`, `new`.`user_defined_val8`), NULLIF(`new`.`user_defined_val8`, `old`.`user_defined_val8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep8`, `new`.`user_defined_rep8`), NULLIF(`new`.`user_defined_rep8`, `old`.`user_defined_rep8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input9`, `new`.`user_defined_input9`), NULLIF(`new`.`user_defined_input9`, `old`.`user_defined_input9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name9`, `new`.`user_defined_name9`), NULLIF(`new`.`user_defined_name9`, `old`.`user_defined_name9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val9`, `new`.`user_defined_val9`), NULLIF(`new`.`user_defined_val9`, `old`.`user_defined_val9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep9`, `new`.`user_defined_rep9`), NULLIF(`new`.`user_defined_rep9`, `old`.`user_defined_rep9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input10`, `new`.`user_defined_input10`), NULLIF(`new`.`user_defined_input10`, `old`.`user_defined_input10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name10`, `new`.`user_defined_name10`), NULLIF(`new`.`user_defined_name10`, `old`.`user_defined_name10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val10`, `new`.`user_defined_val10`), NULLIF(`new`.`user_defined_val10`, `old`.`user_defined_val10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep10`, `new`.`user_defined_rep10`), NULLIF(`new`.`user_defined_rep10`, `old`.`user_defined_rep10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`AS_400_path`, `new`.`AS_400_path`), NULLIF(`new`.`AS_400_path`, `old`.`AS_400_path`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`export_AS400`, `new`.`export_AS400`), NULLIF(`new`.`export_AS400`, `old`.`export_AS400`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`silo_verification`, `new`.`silo_verification`), NULLIF(`new`.`silo_verification`, `old`.`silo_verification`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`use_cameras`, `new`.`use_cameras`), NULLIF(`new`.`use_cameras`, `old`.`use_cameras`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`display_cameras`, `new`.`display_cameras`), NULLIF(`new`.`display_cameras`, `old`.`display_cameras`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`print_cameras_on_ticket`, `new`.`print_cameras_on_ticket`), NULLIF(`new`.`print_cameras_on_ticket`, `old`.`print_cameras_on_ticket`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`ticket_header`, `new`.`ticket_header`), NULLIF(`new`.`ticket_header`, `old`.`ticket_header`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`display_custom_header_img`, `new`.`display_custom_header_img`), NULLIF(`new`.`display_custom_header_img`, `old`.`display_custom_header_img`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`ticket_footer`, `new`.`ticket_footer`), NULLIF(`new`.`ticket_footer`, `old`.`ticket_footer`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`display_custom_footer_img`, `new`.`display_custom_footer_img`), NULLIF(`new`.`display_custom_footer_img`, `old`.`display_custom_footer_img`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input11`, `new`.`user_defined_input11`), NULLIF(`new`.`user_defined_input11`, `old`.`user_defined_input11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name11`, `new`.`user_defined_name11`), NULLIF(`new`.`user_defined_name11`, `old`.`user_defined_name11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val11`, `new`.`user_defined_val11`), NULLIF(`new`.`user_defined_val11`, `old`.`user_defined_val11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep11`, `new`.`user_defined_rep11`), NULLIF(`new`.`user_defined_rep11`, `old`.`user_defined_rep11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input12`, `new`.`user_defined_input12`), NULLIF(`new`.`user_defined_input12`, `old`.`user_defined_input12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name12`, `new`.`user_defined_name12`), NULLIF(`new`.`user_defined_name12`, `old`.`user_defined_name12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val12`, `new`.`user_defined_val12`), NULLIF(`new`.`user_defined_val12`, `old`.`user_defined_val12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep12`, `new`.`user_defined_rep12`), NULLIF(`new`.`user_defined_rep12`, `old`.`user_defined_rep12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input13`, `new`.`user_defined_input13`), NULLIF(`new`.`user_defined_input13`, `old`.`user_defined_input13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name13`, `new`.`user_defined_name13`), NULLIF(`new`.`user_defined_name13`, `old`.`user_defined_name13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val13`, `new`.`user_defined_val13`), NULLIF(`new`.`user_defined_val13`, `old`.`user_defined_val13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep13`, `new`.`user_defined_rep13`), NULLIF(`new`.`user_defined_rep13`, `old`.`user_defined_rep13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input14`, `new`.`user_defined_input14`), NULLIF(`new`.`user_defined_input14`, `old`.`user_defined_input14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name14`, `new`.`user_defined_name14`), NULLIF(`new`.`user_defined_name14`, `old`.`user_defined_name14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val14`, `new`.`user_defined_val14`), NULLIF(`new`.`user_defined_val14`, `old`.`user_defined_val14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep14`, `new`.`user_defined_rep14`), NULLIF(`new`.`user_defined_rep14`, `old`.`user_defined_rep14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input15`, `new`.`user_defined_input15`), NULLIF(`new`.`user_defined_input15`, `old`.`user_defined_input15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name15`, `new`.`user_defined_name15`), NULLIF(`new`.`user_defined_name15`, `old`.`user_defined_name15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val15`, `new`.`user_defined_val15`), NULLIF(`new`.`user_defined_val15`, `old`.`user_defined_val15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep15`, `new`.`user_defined_rep15`), NULLIF(`new`.`user_defined_rep15`, `old`.`user_defined_rep15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input16`, `new`.`user_defined_input16`), NULLIF(`new`.`user_defined_input16`, `old`.`user_defined_input16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name16`, `new`.`user_defined_name16`), NULLIF(`new`.`user_defined_name16`, `old`.`user_defined_name16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val16`, `new`.`user_defined_val16`), NULLIF(`new`.`user_defined_val16`, `old`.`user_defined_val16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep16`, `new`.`user_defined_rep16`), NULLIF(`new`.`user_defined_rep16`, `old`.`user_defined_rep16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input17`, `new`.`user_defined_input17`), NULLIF(`new`.`user_defined_input17`, `old`.`user_defined_input17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name17`, `new`.`user_defined_name17`), NULLIF(`new`.`user_defined_name17`, `old`.`user_defined_name17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val17`, `new`.`user_defined_val17`), NULLIF(`new`.`user_defined_val17`, `old`.`user_defined_val17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep17`, `new`.`user_defined_rep17`), NULLIF(`new`.`user_defined_rep17`, `old`.`user_defined_rep17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input18`, `new`.`user_defined_input18`), NULLIF(`new`.`user_defined_input18`, `old`.`user_defined_input18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name18`, `new`.`user_defined_name18`), NULLIF(`new`.`user_defined_name18`, `old`.`user_defined_name18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val18`, `new`.`user_defined_val18`), NULLIF(`new`.`user_defined_val18`, `old`.`user_defined_val18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep18`, `new`.`user_defined_rep18`), NULLIF(`new`.`user_defined_rep18`, `old`.`user_defined_rep18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input19`, `new`.`user_defined_input19`), NULLIF(`new`.`user_defined_input19`, `old`.`user_defined_input19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name19`, `new`.`user_defined_name19`), NULLIF(`new`.`user_defined_name19`, `old`.`user_defined_name19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val19`, `new`.`user_defined_val19`), NULLIF(`new`.`user_defined_val19`, `old`.`user_defined_val19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep19`, `new`.`user_defined_rep19`), NULLIF(`new`.`user_defined_rep19`, `old`.`user_defined_rep19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input20`, `new`.`user_defined_input20`), NULLIF(`new`.`user_defined_input20`, `old`.`user_defined_input20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name20`, `new`.`user_defined_name20`), NULLIF(`new`.`user_defined_name20`, `old`.`user_defined_name20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val20`, `new`.`user_defined_val20`), NULLIF(`new`.`user_defined_val20`, `old`.`user_defined_val20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep20`, `new`.`user_defined_rep20`), NULLIF(`new`.`user_defined_rep20`, `old`.`user_defined_rep20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`2nd_weighing`, `new`.`2nd_weighing`), NULLIF(`new`.`2nd_weighing`, `old`.`2nd_weighing`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`invoice_enabled`, `new`.`invoice_enabled`), NULLIF(`new`.`invoice_enabled`, `old`.`invoice_enabled`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`contract_enabled`, `new`.`contract_enabled`), NULLIF(`new`.`contract_enabled`, `old`.`contract_enabled`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`moisture_deduction_level`, `new`.`moisture_deduction_level`), NULLIF(`new`.`moisture_deduction_level`, `old`.`moisture_deduction_level`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`prefix`, `new`.`prefix`), NULLIF(`new`.`prefix`, `old`.`prefix`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`enable_moisture`, `new`.`enable_moisture`), NULLIF(`new`.`enable_moisture`, `old`.`enable_moisture`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`enable_handling`, `new`.`enable_handling`), NULLIF(`new`.`enable_handling`, `old`.`enable_handling`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pallet_enabled`, `new`.`pallet_enabled`), NULLIF(`new`.`pallet_enabled`, `old`.`pallet_enabled`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`tares_enabled`, `new`.`tares_enabled`), NULLIF(`new`.`tares_enabled`, `old`.`tares_enabled`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `settings_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`haulier`, `new`.`haulier`), NULLIF(`new`.`haulier`, `old`.`haulier`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`stored_tares`, `new`.`stored_tares`), NULLIF(`new`.`stored_tares`, `old`.`stored_tares`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`numberplate_1`, `new`.`numberplate_1`), NULLIF(`new`.`numberplate_1`, `old`.`numberplate_1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`numberplate_recognition`, `new`.`numberplate_recognition`), NULLIF(`new`.`numberplate_recognition`, `old`.`numberplate_recognition`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`numberplate_2`, `new`.`numberplate_2`), NULLIF(`new`.`numberplate_2`, `old`.`numberplate_2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`numberplate_3`, `new`.`numberplate_3`), NULLIF(`new`.`numberplate_3`, `old`.`numberplate_3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`business_partner`, `new`.`business_partner`), NULLIF(`new`.`business_partner`, `old`.`business_partner`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`use_product_list`, `new`.`use_product_list`), NULLIF(`new`.`use_product_list`, `old`.`use_product_list`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`type_of_weighing`, `new`.`type_of_weighing`), NULLIF(`new`.`type_of_weighing`, `old`.`type_of_weighing`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`first_can_axel`, `new`.`first_can_axel`), NULLIF(`new`.`first_can_axel`, `old`.`first_can_axel`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`second_can_axel`, `new`.`second_can_axel`), NULLIF(`new`.`second_can_axel`, `old`.`second_can_axel`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`goods_type`, `new`.`goods_type`), NULLIF(`new`.`goods_type`, `old`.`goods_type`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`print_ticket`, `new`.`print_ticket`), NULLIF(`new`.`print_ticket`, `old`.`print_ticket`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`reprint`, `new`.`reprint`), NULLIF(`new`.`reprint`, `old`.`reprint`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`custom_fields`, `new`.`custom_fields`), NULLIF(`new`.`custom_fields`, `old`.`custom_fields`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input1`, `new`.`user_defined_input1`), NULLIF(`new`.`user_defined_input1`, `old`.`user_defined_input1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name1`, `new`.`user_defined_name1`), NULLIF(`new`.`user_defined_name1`, `old`.`user_defined_name1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val1`, `new`.`user_defined_val1`), NULLIF(`new`.`user_defined_val1`, `old`.`user_defined_val1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep1`, `new`.`user_defined_rep1`), NULLIF(`new`.`user_defined_rep1`, `old`.`user_defined_rep1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input2`, `new`.`user_defined_input2`), NULLIF(`new`.`user_defined_input2`, `old`.`user_defined_input2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name2`, `new`.`user_defined_name2`), NULLIF(`new`.`user_defined_name2`, `old`.`user_defined_name2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val2`, `new`.`user_defined_val2`), NULLIF(`new`.`user_defined_val2`, `old`.`user_defined_val2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep2`, `new`.`user_defined_rep2`), NULLIF(`new`.`user_defined_rep2`, `old`.`user_defined_rep2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input3`, `new`.`user_defined_input3`), NULLIF(`new`.`user_defined_input3`, `old`.`user_defined_input3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name3`, `new`.`user_defined_name3`), NULLIF(`new`.`user_defined_name3`, `old`.`user_defined_name3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val3`, `new`.`user_defined_val3`), NULLIF(`new`.`user_defined_val3`, `old`.`user_defined_val3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep3`, `new`.`user_defined_rep3`), NULLIF(`new`.`user_defined_rep3`, `old`.`user_defined_rep3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input4`, `new`.`user_defined_input4`), NULLIF(`new`.`user_defined_input4`, `old`.`user_defined_input4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name4`, `new`.`user_defined_name4`), NULLIF(`new`.`user_defined_name4`, `old`.`user_defined_name4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val4`, `new`.`user_defined_val4`), NULLIF(`new`.`user_defined_val4`, `old`.`user_defined_val4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep4`, `new`.`user_defined_rep4`), NULLIF(`new`.`user_defined_rep4`, `old`.`user_defined_rep4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input5`, `new`.`user_defined_input5`), NULLIF(`new`.`user_defined_input5`, `old`.`user_defined_input5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name5`, `new`.`user_defined_name5`), NULLIF(`new`.`user_defined_name5`, `old`.`user_defined_name5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val5`, `new`.`user_defined_val5`), NULLIF(`new`.`user_defined_val5`, `old`.`user_defined_val5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep5`, `new`.`user_defined_rep5`), NULLIF(`new`.`user_defined_rep5`, `old`.`user_defined_rep5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input6`, `new`.`user_defined_input6`), NULLIF(`new`.`user_defined_input6`, `old`.`user_defined_input6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name6`, `new`.`user_defined_name6`), NULLIF(`new`.`user_defined_name6`, `old`.`user_defined_name6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val6`, `new`.`user_defined_val6`), NULLIF(`new`.`user_defined_val6`, `old`.`user_defined_val6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep6`, `new`.`user_defined_rep6`), NULLIF(`new`.`user_defined_rep6`, `old`.`user_defined_rep6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input7`, `new`.`user_defined_input7`), NULLIF(`new`.`user_defined_input7`, `old`.`user_defined_input7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name7`, `new`.`user_defined_name7`), NULLIF(`new`.`user_defined_name7`, `old`.`user_defined_name7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val7`, `new`.`user_defined_val7`), NULLIF(`new`.`user_defined_val7`, `old`.`user_defined_val7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep7`, `new`.`user_defined_rep7`), NULLIF(`new`.`user_defined_rep7`, `old`.`user_defined_rep7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input8`, `new`.`user_defined_input8`), NULLIF(`new`.`user_defined_input8`, `old`.`user_defined_input8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name8`, `new`.`user_defined_name8`), NULLIF(`new`.`user_defined_name8`, `old`.`user_defined_name8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val8`, `new`.`user_defined_val8`), NULLIF(`new`.`user_defined_val8`, `old`.`user_defined_val8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep8`, `new`.`user_defined_rep8`), NULLIF(`new`.`user_defined_rep8`, `old`.`user_defined_rep8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input9`, `new`.`user_defined_input9`), NULLIF(`new`.`user_defined_input9`, `old`.`user_defined_input9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name9`, `new`.`user_defined_name9`), NULLIF(`new`.`user_defined_name9`, `old`.`user_defined_name9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val9`, `new`.`user_defined_val9`), NULLIF(`new`.`user_defined_val9`, `old`.`user_defined_val9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep9`, `new`.`user_defined_rep9`), NULLIF(`new`.`user_defined_rep9`, `old`.`user_defined_rep9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input10`, `new`.`user_defined_input10`), NULLIF(`new`.`user_defined_input10`, `old`.`user_defined_input10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name10`, `new`.`user_defined_name10`), NULLIF(`new`.`user_defined_name10`, `old`.`user_defined_name10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val10`, `new`.`user_defined_val10`), NULLIF(`new`.`user_defined_val10`, `old`.`user_defined_val10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep10`, `new`.`user_defined_rep10`), NULLIF(`new`.`user_defined_rep10`, `old`.`user_defined_rep10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`AS_400_path`, `new`.`AS_400_path`), NULLIF(`new`.`AS_400_path`, `old`.`AS_400_path`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`export_AS400`, `new`.`export_AS400`), NULLIF(`new`.`export_AS400`, `old`.`export_AS400`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`silo_verification`, `new`.`silo_verification`), NULLIF(`new`.`silo_verification`, `old`.`silo_verification`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`use_cameras`, `new`.`use_cameras`), NULLIF(`new`.`use_cameras`, `old`.`use_cameras`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`display_cameras`, `new`.`display_cameras`), NULLIF(`new`.`display_cameras`, `old`.`display_cameras`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`print_cameras_on_ticket`, `new`.`print_cameras_on_ticket`), NULLIF(`new`.`print_cameras_on_ticket`, `old`.`print_cameras_on_ticket`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`ticket_header`, `new`.`ticket_header`), NULLIF(`new`.`ticket_header`, `old`.`ticket_header`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`display_custom_header_img`, `new`.`display_custom_header_img`), NULLIF(`new`.`display_custom_header_img`, `old`.`display_custom_header_img`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`ticket_footer`, `new`.`ticket_footer`), NULLIF(`new`.`ticket_footer`, `old`.`ticket_footer`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`display_custom_footer_img`, `new`.`display_custom_footer_img`), NULLIF(`new`.`display_custom_footer_img`, `old`.`display_custom_footer_img`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input11`, `new`.`user_defined_input11`), NULLIF(`new`.`user_defined_input11`, `old`.`user_defined_input11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name11`, `new`.`user_defined_name11`), NULLIF(`new`.`user_defined_name11`, `old`.`user_defined_name11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val11`, `new`.`user_defined_val11`), NULLIF(`new`.`user_defined_val11`, `old`.`user_defined_val11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep11`, `new`.`user_defined_rep11`), NULLIF(`new`.`user_defined_rep11`, `old`.`user_defined_rep11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input12`, `new`.`user_defined_input12`), NULLIF(`new`.`user_defined_input12`, `old`.`user_defined_input12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name12`, `new`.`user_defined_name12`), NULLIF(`new`.`user_defined_name12`, `old`.`user_defined_name12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val12`, `new`.`user_defined_val12`), NULLIF(`new`.`user_defined_val12`, `old`.`user_defined_val12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep12`, `new`.`user_defined_rep12`), NULLIF(`new`.`user_defined_rep12`, `old`.`user_defined_rep12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input13`, `new`.`user_defined_input13`), NULLIF(`new`.`user_defined_input13`, `old`.`user_defined_input13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name13`, `new`.`user_defined_name13`), NULLIF(`new`.`user_defined_name13`, `old`.`user_defined_name13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val13`, `new`.`user_defined_val13`), NULLIF(`new`.`user_defined_val13`, `old`.`user_defined_val13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep13`, `new`.`user_defined_rep13`), NULLIF(`new`.`user_defined_rep13`, `old`.`user_defined_rep13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input14`, `new`.`user_defined_input14`), NULLIF(`new`.`user_defined_input14`, `old`.`user_defined_input14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name14`, `new`.`user_defined_name14`), NULLIF(`new`.`user_defined_name14`, `old`.`user_defined_name14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val14`, `new`.`user_defined_val14`), NULLIF(`new`.`user_defined_val14`, `old`.`user_defined_val14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep14`, `new`.`user_defined_rep14`), NULLIF(`new`.`user_defined_rep14`, `old`.`user_defined_rep14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input15`, `new`.`user_defined_input15`), NULLIF(`new`.`user_defined_input15`, `old`.`user_defined_input15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name15`, `new`.`user_defined_name15`), NULLIF(`new`.`user_defined_name15`, `old`.`user_defined_name15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val15`, `new`.`user_defined_val15`), NULLIF(`new`.`user_defined_val15`, `old`.`user_defined_val15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep15`, `new`.`user_defined_rep15`), NULLIF(`new`.`user_defined_rep15`, `old`.`user_defined_rep15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input16`, `new`.`user_defined_input16`), NULLIF(`new`.`user_defined_input16`, `old`.`user_defined_input16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name16`, `new`.`user_defined_name16`), NULLIF(`new`.`user_defined_name16`, `old`.`user_defined_name16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val16`, `new`.`user_defined_val16`), NULLIF(`new`.`user_defined_val16`, `old`.`user_defined_val16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep16`, `new`.`user_defined_rep16`), NULLIF(`new`.`user_defined_rep16`, `old`.`user_defined_rep16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input17`, `new`.`user_defined_input17`), NULLIF(`new`.`user_defined_input17`, `old`.`user_defined_input17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name17`, `new`.`user_defined_name17`), NULLIF(`new`.`user_defined_name17`, `old`.`user_defined_name17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val17`, `new`.`user_defined_val17`), NULLIF(`new`.`user_defined_val17`, `old`.`user_defined_val17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep17`, `new`.`user_defined_rep17`), NULLIF(`new`.`user_defined_rep17`, `old`.`user_defined_rep17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input18`, `new`.`user_defined_input18`), NULLIF(`new`.`user_defined_input18`, `old`.`user_defined_input18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name18`, `new`.`user_defined_name18`), NULLIF(`new`.`user_defined_name18`, `old`.`user_defined_name18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val18`, `new`.`user_defined_val18`), NULLIF(`new`.`user_defined_val18`, `old`.`user_defined_val18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep18`, `new`.`user_defined_rep18`), NULLIF(`new`.`user_defined_rep18`, `old`.`user_defined_rep18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input19`, `new`.`user_defined_input19`), NULLIF(`new`.`user_defined_input19`, `old`.`user_defined_input19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name19`, `new`.`user_defined_name19`), NULLIF(`new`.`user_defined_name19`, `old`.`user_defined_name19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val19`, `new`.`user_defined_val19`), NULLIF(`new`.`user_defined_val19`, `old`.`user_defined_val19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep19`, `new`.`user_defined_rep19`), NULLIF(`new`.`user_defined_rep19`, `old`.`user_defined_rep19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_input20`, `new`.`user_defined_input20`), NULLIF(`new`.`user_defined_input20`, `old`.`user_defined_input20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_name20`, `new`.`user_defined_name20`), NULLIF(`new`.`user_defined_name20`, `old`.`user_defined_name20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_val20`, `new`.`user_defined_val20`), NULLIF(`new`.`user_defined_val20`, `old`.`user_defined_val20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_defined_rep20`, `new`.`user_defined_rep20`), NULLIF(`new`.`user_defined_rep20`, `old`.`user_defined_rep20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`2nd_weighing`, `new`.`2nd_weighing`), NULLIF(`new`.`2nd_weighing`, `old`.`2nd_weighing`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`invoice_enabled`, `new`.`invoice_enabled`), NULLIF(`new`.`invoice_enabled`, `old`.`invoice_enabled`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`contract_enabled`, `new`.`contract_enabled`), NULLIF(`new`.`contract_enabled`, `old`.`contract_enabled`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`moisture_deduction_level`, `new`.`moisture_deduction_level`), NULLIF(`new`.`moisture_deduction_level`, `old`.`moisture_deduction_level`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`prefix`, `new`.`prefix`), NULLIF(`new`.`prefix`, `old`.`prefix`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`enable_moisture`, `new`.`enable_moisture`), NULLIF(`new`.`enable_moisture`, `old`.`enable_moisture`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`enable_handling`, `new`.`enable_handling`), NULLIF(`new`.`enable_handling`, `old`.`enable_handling`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pallet_enabled`, `new`.`pallet_enabled`), NULLIF(`new`.`pallet_enabled`, `old`.`pallet_enabled`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`tares_enabled`, `new`.`tares_enabled`), NULLIF(`new`.`tares_enabled`, `old`.`tares_enabled`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `settings_tracking`
--

CREATE TABLE `settings_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sites`
--

CREATE TABLE `sites` (
  `id` int(10) UNSIGNED NOT NULL,
  `site_type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `site_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `finger_active` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `override_silo` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `site_active` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `custom_header_text` blob NOT NULL,
  `custom_footer_text` blob NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `measure_type` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `deduct_flow` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `decimals` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `sites`
--
DELIMITER $$
CREATE TRIGGER `sites_delete_trigger` AFTER DELETE ON `sites` FOR EACH ROW BEGIN
	INSERT INTO `sites_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `sites_insert_trigger` AFTER INSERT ON `sites` FOR EACH ROW BEGIN
	INSERT INTO `sites_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `sites_update_trigger` AFTER UPDATE ON `sites` FOR EACH ROW Begin 
	UPDATE `sites_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `sites_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`site_type`, `new`.`site_type`), NULLIF(`new`.`site_type`, `old`.`site_type`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_name`, `new`.`site_name`), NULLIF(`new`.`site_name`, `old`.`site_name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`finger_active`, `new`.`finger_active`), NULLIF(`new`.`finger_active`, `old`.`finger_active`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`override_silo`, `new`.`override_silo`), NULLIF(`new`.`override_silo`, `old`.`override_silo`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_active`, `new`.`site_active`), NULLIF(`new`.`site_active`, `old`.`site_active`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`custom_header_text`, `new`.`custom_header_text`), NULLIF(`new`.`custom_header_text`, `old`.`custom_header_text`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`custom_footer_text`, `new`.`custom_footer_text`), NULLIF(`new`.`custom_footer_text`, `old`.`custom_footer_text`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `sites_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`site_type`, `new`.`site_type`), NULLIF(`new`.`site_type`, `old`.`site_type`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_name`, `new`.`site_name`), NULLIF(`new`.`site_name`, `old`.`site_name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`finger_active`, `new`.`finger_active`), NULLIF(`new`.`finger_active`, `old`.`finger_active`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`override_silo`, `new`.`override_silo`), NULLIF(`new`.`override_silo`, `old`.`override_silo`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_active`, `new`.`site_active`), NULLIF(`new`.`site_active`, `old`.`site_active`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`custom_header_text`, `new`.`custom_header_text`), NULLIF(`new`.`custom_header_text`, `old`.`custom_header_text`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`custom_footer_text`, `new`.`custom_footer_text`), NULLIF(`new`.`custom_footer_text`, `old`.`custom_footer_text`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `sites_tracking`
--

CREATE TABLE `sites_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tares`
--

CREATE TABLE `tares` (
  `id` int(10) UNSIGNED NOT NULL,
  `registration_no` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weight` decimal(8,2) NOT NULL,
  `company_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `expiry_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `weighbridge_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `tares`
--
DELIMITER $$
CREATE TRIGGER `tares_delete_trigger` AFTER DELETE ON `tares` FOR EACH ROW BEGIN
	INSERT INTO `tares_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tares_insert_trigger` AFTER INSERT ON `tares` FOR EACH ROW BEGIN
	INSERT INTO `tares_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tares_update_trigger` AFTER UPDATE ON `tares` FOR EACH ROW Begin 
	UPDATE `tares_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `tares_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`registration_no`, `new`.`registration_no`), NULLIF(`new`.`registration_no`, `old`.`registration_no`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight`, `new`.`weight`), NULLIF(`new`.`weight`, `old`.`weight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`expiry_date`, `new`.`expiry_date`), NULLIF(`new`.`expiry_date`, `old`.`expiry_date`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `tares_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`registration_no`, `new`.`registration_no`), NULLIF(`new`.`registration_no`, `old`.`registration_no`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight`, `new`.`weight`), NULLIF(`new`.`weight`, `old`.`weight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`expiry_date`, `new`.`expiry_date`), NULLIF(`new`.`expiry_date`, `old`.`expiry_date`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `tares_tracking`
--

CREATE TABLE `tares_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `current_id` int(11) NOT NULL,
  `settings_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

--
-- Triggers `transactions`
--
DELIMITER $$
CREATE TRIGGER `transactions_delete_trigger` AFTER DELETE ON `transactions` FOR EACH ROW BEGIN
	INSERT INTO `transactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `transactions_insert_trigger` AFTER INSERT ON `transactions` FOR EACH ROW BEGIN
	INSERT INTO `transactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `transactions_update_trigger` AFTER UPDATE ON `transactions` FOR EACH ROW Begin 
	UPDATE `transactions_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `transactions_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`current_id`, `new`.`current_id`), NULLIF(`new`.`current_id`, `old`.`current_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`settings_id`, `new`.`settings_id`), NULLIF(`new`.`settings_id`, `old`.`settings_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `transactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`current_id`, `new`.`current_id`), NULLIF(`new`.`current_id`, `old`.`current_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`settings_id`, `new`.`settings_id`), NULLIF(`new`.`settings_id`, `old`.`settings_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `transactions_tracking`
--

CREATE TABLE `transactions_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `firstname` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `lastname` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_num` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(60) COLLATE utf8_unicode_ci NOT NULL,
  `role_id` int(10) UNSIGNED DEFAULT NULL,
  `site_id` int(10) UNSIGNED DEFAULT NULL,
  `workstations_id` int(10) UNSIGNED DEFAULT NULL,
  `company_id` int(10) UNSIGNED DEFAULT NULL,
  `token` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `fingerprint` text COLLATE utf8_unicode_ci NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `users`
--
DELIMITER $$
CREATE TRIGGER `users_delete_trigger` AFTER DELETE ON `users` FOR EACH ROW BEGIN
	INSERT INTO `users_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `users_insert_trigger` AFTER INSERT ON `users` FOR EACH ROW BEGIN
	INSERT INTO `users_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `users_update_trigger` AFTER UPDATE ON `users` FOR EACH ROW Begin 
	UPDATE `users_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `users_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`firstname`, `new`.`firstname`), NULLIF(`new`.`firstname`, `old`.`firstname`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`lastname`, `new`.`lastname`), NULLIF(`new`.`lastname`, `old`.`lastname`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`contact_num`, `new`.`contact_num`), NULLIF(`new`.`contact_num`, `old`.`contact_num`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`email`, `new`.`email`), NULLIF(`new`.`email`, `old`.`email`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`password`, `new`.`password`), NULLIF(`new`.`password`, `old`.`password`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`role_id`, `new`.`role_id`), NULLIF(`new`.`role_id`, `old`.`role_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstations_id`, `new`.`workstations_id`), NULLIF(`new`.`workstations_id`, `old`.`workstations_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`token`, `new`.`token`), NULLIF(`new`.`token`, `old`.`token`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`fingerprint`, `new`.`fingerprint`), NULLIF(`new`.`fingerprint`, `old`.`fingerprint`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `users_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`firstname`, `new`.`firstname`), NULLIF(`new`.`firstname`, `old`.`firstname`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`lastname`, `new`.`lastname`), NULLIF(`new`.`lastname`, `old`.`lastname`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`contact_num`, `new`.`contact_num`), NULLIF(`new`.`contact_num`, `old`.`contact_num`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`email`, `new`.`email`), NULLIF(`new`.`email`, `old`.`email`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`password`, `new`.`password`), NULLIF(`new`.`password`, `old`.`password`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`role_id`, `new`.`role_id`), NULLIF(`new`.`role_id`, `old`.`role_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstations_id`, `new`.`workstations_id`), NULLIF(`new`.`workstations_id`, `old`.`workstations_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`token`, `new`.`token`), NULLIF(`new`.`token`, `old`.`token`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`fingerprint`, `new`.`fingerprint`), NULLIF(`new`.`fingerprint`, `old`.`fingerprint`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users_tracking`
--

CREATE TABLE `users_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `usertypes`
--

CREATE TABLE `usertypes` (
  `id` int(10) UNSIGNED NOT NULL,
  `usertypes` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `level` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `companies` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `sites` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `workstations` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weighbridges` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `cameras` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weigh_types` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `weighing` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `verify` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `reprint` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `business_partner` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `products` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `hauliers` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `stored_tares` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `rfid_vehicle` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `axel_types` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `axel_settings` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `transaction_report` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `exception_report` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `users` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `user_types` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `delete_transaction_flag` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `usertypes`
--
DELIMITER $$
CREATE TRIGGER `usertypes_delete_trigger` AFTER DELETE ON `usertypes` FOR EACH ROW BEGIN
	INSERT INTO `usertypes_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `usertypes_insert_trigger` AFTER INSERT ON `usertypes` FOR EACH ROW BEGIN
	INSERT INTO `usertypes_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `usertypes_update_trigger` AFTER UPDATE ON `usertypes` FOR EACH ROW Begin 
	UPDATE `usertypes_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `usertypes_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`usertypes`, `new`.`usertypes`), NULLIF(`new`.`usertypes`, `old`.`usertypes`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`level`, `new`.`level`), NULLIF(`new`.`level`, `old`.`level`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`companies`, `new`.`companies`), NULLIF(`new`.`companies`, `old`.`companies`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`sites`, `new`.`sites`), NULLIF(`new`.`sites`, `old`.`sites`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstations`, `new`.`workstations`), NULLIF(`new`.`workstations`, `old`.`workstations`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridges`, `new`.`weighbridges`), NULLIF(`new`.`weighbridges`, `old`.`weighbridges`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`cameras`, `new`.`cameras`), NULLIF(`new`.`cameras`, `old`.`cameras`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weigh_types`, `new`.`weigh_types`), NULLIF(`new`.`weigh_types`, `old`.`weigh_types`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing`, `new`.`weighing`), NULLIF(`new`.`weighing`, `old`.`weighing`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`verify`, `new`.`verify`), NULLIF(`new`.`verify`, `old`.`verify`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`reprint`, `new`.`reprint`), NULLIF(`new`.`reprint`, `old`.`reprint`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`business_partner`, `new`.`business_partner`), NULLIF(`new`.`business_partner`, `old`.`business_partner`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`products`, `new`.`products`), NULLIF(`new`.`products`, `old`.`products`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`hauliers`, `new`.`hauliers`), NULLIF(`new`.`hauliers`, `old`.`hauliers`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`stored_tares`, `new`.`stored_tares`), NULLIF(`new`.`stored_tares`, `old`.`stored_tares`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`rfid_vehicle`, `new`.`rfid_vehicle`), NULLIF(`new`.`rfid_vehicle`, `old`.`rfid_vehicle`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_types`, `new`.`axel_types`), NULLIF(`new`.`axel_types`, `old`.`axel_types`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_settings`, `new`.`axel_settings`), NULLIF(`new`.`axel_settings`, `old`.`axel_settings`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`transaction_report`, `new`.`transaction_report`), NULLIF(`new`.`transaction_report`, `old`.`transaction_report`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`exception_report`, `new`.`exception_report`), NULLIF(`new`.`exception_report`, `old`.`exception_report`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`users`, `new`.`users`), NULLIF(`new`.`users`, `old`.`users`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_types`, `new`.`user_types`), NULLIF(`new`.`user_types`, `old`.`user_types`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `usertypes_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`usertypes`, `new`.`usertypes`), NULLIF(`new`.`usertypes`, `old`.`usertypes`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`level`, `new`.`level`), NULLIF(`new`.`level`, `old`.`level`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`companies`, `new`.`companies`), NULLIF(`new`.`companies`, `old`.`companies`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`sites`, `new`.`sites`), NULLIF(`new`.`sites`, `old`.`sites`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstations`, `new`.`workstations`), NULLIF(`new`.`workstations`, `old`.`workstations`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridges`, `new`.`weighbridges`), NULLIF(`new`.`weighbridges`, `old`.`weighbridges`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`cameras`, `new`.`cameras`), NULLIF(`new`.`cameras`, `old`.`cameras`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weigh_types`, `new`.`weigh_types`), NULLIF(`new`.`weigh_types`, `old`.`weigh_types`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing`, `new`.`weighing`), NULLIF(`new`.`weighing`, `old`.`weighing`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`verify`, `new`.`verify`), NULLIF(`new`.`verify`, `old`.`verify`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`reprint`, `new`.`reprint`), NULLIF(`new`.`reprint`, `old`.`reprint`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`business_partner`, `new`.`business_partner`), NULLIF(`new`.`business_partner`, `old`.`business_partner`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`products`, `new`.`products`), NULLIF(`new`.`products`, `old`.`products`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`hauliers`, `new`.`hauliers`), NULLIF(`new`.`hauliers`, `old`.`hauliers`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`stored_tares`, `new`.`stored_tares`), NULLIF(`new`.`stored_tares`, `old`.`stored_tares`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`rfid_vehicle`, `new`.`rfid_vehicle`), NULLIF(`new`.`rfid_vehicle`, `old`.`rfid_vehicle`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_types`, `new`.`axel_types`), NULLIF(`new`.`axel_types`, `old`.`axel_types`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`axel_settings`, `new`.`axel_settings`), NULLIF(`new`.`axel_settings`, `old`.`axel_settings`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`transaction_report`, `new`.`transaction_report`), NULLIF(`new`.`transaction_report`, `old`.`transaction_report`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`exception_report`, `new`.`exception_report`), NULLIF(`new`.`exception_report`, `old`.`exception_report`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`users`, `new`.`users`), NULLIF(`new`.`users`, `old`.`users`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`user_types`, `new`.`user_types`), NULLIF(`new`.`user_types`, `old`.`user_types`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `usertypes_tracking`
--

CREATE TABLE `usertypes_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `weighbridges`
--

CREATE TABLE `weighbridges` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `ip_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `port_num` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `baud_rate` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `data_bits` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `parity` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `stop_bits` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weight_reg` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weight_sep` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `weight_num_amt` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `weight_special` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `decimal_places` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `stable_samples` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `manual` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `in_reverse` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weight` double(10,2) NOT NULL,
  `workstation_id` int(10) UNSIGNED NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `weighing_transaction_flag` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `scale` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `remote_display` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `display_ip_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `display_port_num` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `display_data_bits` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `display_baud_rate` varchar(255) COLLATE utf8_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `weighbridges`
--
DELIMITER $$
CREATE TRIGGER `weighbridges_delete_trigger` AFTER DELETE ON `weighbridges` FOR EACH ROW BEGIN
	INSERT INTO `weighbridges_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighbridges_insert_trigger` AFTER INSERT ON `weighbridges` FOR EACH ROW BEGIN
	INSERT INTO `weighbridges_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighbridges_update_trigger` AFTER UPDATE ON `weighbridges` FOR EACH ROW Begin 
	UPDATE `weighbridges_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `weighbridges_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`ip_address`, `new`.`ip_address`), NULLIF(`new`.`ip_address`, `old`.`ip_address`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`port_num`, `new`.`port_num`), NULLIF(`new`.`port_num`, `old`.`port_num`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`baud_rate`, `new`.`baud_rate`), NULLIF(`new`.`baud_rate`, `old`.`baud_rate`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`data_bits`, `new`.`data_bits`), NULLIF(`new`.`data_bits`, `old`.`data_bits`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`parity`, `new`.`parity`), NULLIF(`new`.`parity`, `old`.`parity`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`stop_bits`, `new`.`stop_bits`), NULLIF(`new`.`stop_bits`, `old`.`stop_bits`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight_reg`, `new`.`weight_reg`), NULLIF(`new`.`weight_reg`, `old`.`weight_reg`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight_sep`, `new`.`weight_sep`), NULLIF(`new`.`weight_sep`, `old`.`weight_sep`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight_num_amt`, `new`.`weight_num_amt`), NULLIF(`new`.`weight_num_amt`, `old`.`weight_num_amt`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight_special`, `new`.`weight_special`), NULLIF(`new`.`weight_special`, `old`.`weight_special`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`decimal_places`, `new`.`decimal_places`), NULLIF(`new`.`decimal_places`, `old`.`decimal_places`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`stable_samples`, `new`.`stable_samples`), NULLIF(`new`.`stable_samples`, `old`.`stable_samples`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`manual`, `new`.`manual`), NULLIF(`new`.`manual`, `old`.`manual`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`in_reverse`, `new`.`in_reverse`), NULLIF(`new`.`in_reverse`, `old`.`in_reverse`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight`, `new`.`weight`), NULLIF(`new`.`weight`, `old`.`weight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_transaction_flag`, `new`.`weighing_transaction_flag`), NULLIF(`new`.`weighing_transaction_flag`, `old`.`weighing_transaction_flag`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `weighbridges_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`name`, `new`.`name`), NULLIF(`new`.`name`, `old`.`name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`ip_address`, `new`.`ip_address`), NULLIF(`new`.`ip_address`, `old`.`ip_address`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`code`, `new`.`code`), NULLIF(`new`.`code`, `old`.`code`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`port_num`, `new`.`port_num`), NULLIF(`new`.`port_num`, `old`.`port_num`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`baud_rate`, `new`.`baud_rate`), NULLIF(`new`.`baud_rate`, `old`.`baud_rate`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`data_bits`, `new`.`data_bits`), NULLIF(`new`.`data_bits`, `old`.`data_bits`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`parity`, `new`.`parity`), NULLIF(`new`.`parity`, `old`.`parity`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`stop_bits`, `new`.`stop_bits`), NULLIF(`new`.`stop_bits`, `old`.`stop_bits`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight_reg`, `new`.`weight_reg`), NULLIF(`new`.`weight_reg`, `old`.`weight_reg`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight_sep`, `new`.`weight_sep`), NULLIF(`new`.`weight_sep`, `old`.`weight_sep`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight_num_amt`, `new`.`weight_num_amt`), NULLIF(`new`.`weight_num_amt`, `old`.`weight_num_amt`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight_special`, `new`.`weight_special`), NULLIF(`new`.`weight_special`, `old`.`weight_special`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`decimal_places`, `new`.`decimal_places`), NULLIF(`new`.`decimal_places`, `old`.`decimal_places`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`stable_samples`, `new`.`stable_samples`), NULLIF(`new`.`stable_samples`, `old`.`stable_samples`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`manual`, `new`.`manual`), NULLIF(`new`.`manual`, `old`.`manual`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`in_reverse`, `new`.`in_reverse`), NULLIF(`new`.`in_reverse`, `old`.`in_reverse`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weight`, `new`.`weight`), NULLIF(`new`.`weight`, `old`.`weight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_transaction_flag`, `new`.`weighing_transaction_flag`), NULLIF(`new`.`weighing_transaction_flag`, `old`.`weighing_transaction_flag`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `weighbridges_tracking`
--

CREATE TABLE `weighbridges_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `weighingcameras`
--

CREATE TABLE `weighingcameras` (
  `id` binary(16) NOT NULL,
  `base64` mediumblob DEFAULT NULL,
  `isnpr` varchar(255) NOT NULL,
  `weighing_transaction_id` binary(16) DEFAULT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Triggers `weighingcameras`
--
DELIMITER $$
CREATE TRIGGER `weighingcameras_delete_trigger` AFTER DELETE ON `weighingcameras` FOR EACH ROW BEGIN
	INSERT INTO `weighingcameras_tracking` (
		`id`
		,`site_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,old.`site_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighingcameras_insert_trigger` AFTER INSERT ON `weighingcameras` FOR EACH ROW BEGIN
	INSERT INTO `weighingcameras_tracking` (
		`id`
		,`site_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,new.`site_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighingcameras_update_trigger` AFTER UPDATE ON `weighingcameras` FOR EACH ROW Begin 
	UPDATE `weighingcameras_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `weighingcameras_tracking`.`id` = new.`id` AND `weighingcameras_tracking`.`site_id` = new.`site_id`
	 AND (
	    IFNULL(NULLIF(`old`.`base64`, `new`.`base64`), NULLIF(`new`.`base64`, `old`.`base64`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`isnpr`, `new`.`isnpr`), NULLIF(`new`.`isnpr`, `old`.`isnpr`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_transaction_id`, `new`.`weighing_transaction_id`), NULLIF(`new`.`weighing_transaction_id`, `old`.`weighing_transaction_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `weighingcameras_tracking` (
		`id`
		,`site_id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,new.`site_id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`base64`, `new`.`base64`), NULLIF(`new`.`base64`, `old`.`base64`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`isnpr`, `new`.`isnpr`), NULLIF(`new`.`isnpr`, `old`.`isnpr`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_transaction_id`, `new`.`weighing_transaction_id`), NULLIF(`new`.`weighing_transaction_id`, `old`.`weighing_transaction_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `weighingcameras_old`
--

CREATE TABLE `weighingcameras_old` (
  `id` int(11) NOT NULL,
  `base64` text NOT NULL,
  `isnpr` varchar(255) NOT NULL,
  `weighing_transaction_id` int(11) NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Triggers `weighingcameras_old`
--
DELIMITER $$
CREATE TRIGGER `weighingcameras_old_delete_trigger` AFTER DELETE ON `weighingcameras_old` FOR EACH ROW BEGIN
	INSERT INTO `weighingcameras_old_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighingcameras_old_insert_trigger` AFTER INSERT ON `weighingcameras_old` FOR EACH ROW BEGIN
	INSERT INTO `weighingcameras_old_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighingcameras_old_update_trigger` AFTER UPDATE ON `weighingcameras_old` FOR EACH ROW Begin 
	UPDATE `weighingcameras_old_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `weighingcameras_old_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`base64`, `new`.`base64`), NULLIF(`new`.`base64`, `old`.`base64`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`isnpr`, `new`.`isnpr`), NULLIF(`new`.`isnpr`, `old`.`isnpr`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_transaction_id`, `new`.`weighing_transaction_id`), NULLIF(`new`.`weighing_transaction_id`, `old`.`weighing_transaction_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `weighingcameras_old_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`base64`, `new`.`base64`), NULLIF(`new`.`base64`, `old`.`base64`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`isnpr`, `new`.`isnpr`), NULLIF(`new`.`isnpr`, `old`.`isnpr`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_transaction_id`, `new`.`weighing_transaction_id`), NULLIF(`new`.`weighing_transaction_id`, `old`.`weighing_transaction_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `weighingcameras_old_tracking`
--

CREATE TABLE `weighingcameras_old_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `weighingcameras_tracking`
--

CREATE TABLE `weighingcameras_tracking` (
  `id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `weighingheaders`
--

CREATE TABLE `weighingheaders` (
  `id` binary(16) NOT NULL,
  `transaction` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `settings_id` int(10) DEFAULT NULL,
  `RegNumber` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `RegNumber2` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `RegNumber3` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom1` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom2` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom3` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom4` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom5` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom6` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom7` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom8` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom9` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom10` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `FirstWeight` double(18,4) DEFAULT NULL,
  `SecondWeight` double(18,4) DEFAULT NULL,
  `TotalWeight` double(18,4) DEFAULT NULL,
  `NettWeight` int(11) DEFAULT NULL,
  `businesspartner_id` int(10) UNSIGNED DEFAULT NULL,
  `product_id` int(10) UNSIGNED DEFAULT NULL,
  `grade_id` int(10) UNSIGNED DEFAULT NULL,
  `haulier_id` int(10) UNSIGNED DEFAULT NULL,
  `weighbridge_id` int(10) UNSIGNED NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `Custom11` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom12` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom13` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom14` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom15` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom16` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom17` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom18` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom19` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `Custom20` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `reason` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `status` varchar(100) COLLATE utf8_unicode_ci NOT NULL,
  `price` decimal(8,2) DEFAULT 0.00,
  `moisture_deduction` decimal(8,2) DEFAULT 0.00,
  `handling_charges` decimal(11,2) DEFAULT 0.00,
  `pallet_id` int(10) UNSIGNED DEFAULT NULL,
  `pallet_charges` decimal(8,2) DEFAULT 0.00,
  `pallet_count` int(11) DEFAULT 0,
  `tare_id` int(11) DEFAULT NULL,
  `firstWeightUserId` int(10) UNSIGNED NOT NULL DEFAULT 21,
  `secondWeightUserId` int(10) UNSIGNED DEFAULT NULL,
  `verifyUserId` int(10) UNSIGNED DEFAULT NULL,
  `deletedUserId` int(10) UNSIGNED DEFAULT NULL,
  `workstation_id` int(10) UNSIGNED NOT NULL,
  `moisture_threshold` decimal(8,2) DEFAULT NULL,
  `moistureCoefficient` decimal(20,8) DEFAULT NULL,
  `moistureWeight` decimal(20,8) DEFAULT NULL,
  `handlingWeight` decimal(20,8) DEFAULT NULL,
  `grades` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `weighingheaders`
--
DELIMITER $$
CREATE TRIGGER `weighingheaders_delete_trigger` AFTER DELETE ON `weighingheaders` FOR EACH ROW BEGIN
	INSERT INTO `weighingheaders_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighingheaders_insert_trigger` AFTER INSERT ON `weighingheaders` FOR EACH ROW BEGIN
	INSERT INTO `weighingheaders_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighingheaders_update_trigger` AFTER UPDATE ON `weighingheaders` FOR EACH ROW Begin 
	UPDATE `weighingheaders_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `weighingheaders_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`transaction`, `new`.`transaction`), NULLIF(`new`.`transaction`, `old`.`transaction`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`settings_id`, `new`.`settings_id`), NULLIF(`new`.`settings_id`, `old`.`settings_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`RegNumber`, `new`.`RegNumber`), NULLIF(`new`.`RegNumber`, `old`.`RegNumber`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`RegNumber2`, `new`.`RegNumber2`), NULLIF(`new`.`RegNumber2`, `old`.`RegNumber2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`RegNumber3`, `new`.`RegNumber3`), NULLIF(`new`.`RegNumber3`, `old`.`RegNumber3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom1`, `new`.`Custom1`), NULLIF(`new`.`Custom1`, `old`.`Custom1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom2`, `new`.`Custom2`), NULLIF(`new`.`Custom2`, `old`.`Custom2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom3`, `new`.`Custom3`), NULLIF(`new`.`Custom3`, `old`.`Custom3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom4`, `new`.`Custom4`), NULLIF(`new`.`Custom4`, `old`.`Custom4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom5`, `new`.`Custom5`), NULLIF(`new`.`Custom5`, `old`.`Custom5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom6`, `new`.`Custom6`), NULLIF(`new`.`Custom6`, `old`.`Custom6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom7`, `new`.`Custom7`), NULLIF(`new`.`Custom7`, `old`.`Custom7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom8`, `new`.`Custom8`), NULLIF(`new`.`Custom8`, `old`.`Custom8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom9`, `new`.`Custom9`), NULLIF(`new`.`Custom9`, `old`.`Custom9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom10`, `new`.`Custom10`), NULLIF(`new`.`Custom10`, `old`.`Custom10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`FirstWeight`, `new`.`FirstWeight`), NULLIF(`new`.`FirstWeight`, `old`.`FirstWeight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`SecondWeight`, `new`.`SecondWeight`), NULLIF(`new`.`SecondWeight`, `old`.`SecondWeight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`TotalWeight`, `new`.`TotalWeight`), NULLIF(`new`.`TotalWeight`, `old`.`TotalWeight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`NettWeight`, `new`.`NettWeight`), NULLIF(`new`.`NettWeight`, `old`.`NettWeight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`businesspartner_id`, `new`.`businesspartner_id`), NULLIF(`new`.`businesspartner_id`, `old`.`businesspartner_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`product_id`, `new`.`product_id`), NULLIF(`new`.`product_id`, `old`.`product_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`grade_id`, `new`.`grade_id`), NULLIF(`new`.`grade_id`, `old`.`grade_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`haulier_id`, `new`.`haulier_id`), NULLIF(`new`.`haulier_id`, `old`.`haulier_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom11`, `new`.`Custom11`), NULLIF(`new`.`Custom11`, `old`.`Custom11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom12`, `new`.`Custom12`), NULLIF(`new`.`Custom12`, `old`.`Custom12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom13`, `new`.`Custom13`), NULLIF(`new`.`Custom13`, `old`.`Custom13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom14`, `new`.`Custom14`), NULLIF(`new`.`Custom14`, `old`.`Custom14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom15`, `new`.`Custom15`), NULLIF(`new`.`Custom15`, `old`.`Custom15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom16`, `new`.`Custom16`), NULLIF(`new`.`Custom16`, `old`.`Custom16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom17`, `new`.`Custom17`), NULLIF(`new`.`Custom17`, `old`.`Custom17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom18`, `new`.`Custom18`), NULLIF(`new`.`Custom18`, `old`.`Custom18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom19`, `new`.`Custom19`), NULLIF(`new`.`Custom19`, `old`.`Custom19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom20`, `new`.`Custom20`), NULLIF(`new`.`Custom20`, `old`.`Custom20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`reason`, `new`.`reason`), NULLIF(`new`.`reason`, `old`.`reason`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`status`, `new`.`status`), NULLIF(`new`.`status`, `old`.`status`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`price`, `new`.`price`), NULLIF(`new`.`price`, `old`.`price`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`moisture_deduction`, `new`.`moisture_deduction`), NULLIF(`new`.`moisture_deduction`, `old`.`moisture_deduction`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`handling_charges`, `new`.`handling_charges`), NULLIF(`new`.`handling_charges`, `old`.`handling_charges`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pallet_id`, `new`.`pallet_id`), NULLIF(`new`.`pallet_id`, `old`.`pallet_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pallet_charges`, `new`.`pallet_charges`), NULLIF(`new`.`pallet_charges`, `old`.`pallet_charges`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pallet_count`, `new`.`pallet_count`), NULLIF(`new`.`pallet_count`, `old`.`pallet_count`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`tare_id`, `new`.`tare_id`), NULLIF(`new`.`tare_id`, `old`.`tare_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`firstWeightUserId`, `new`.`firstWeightUserId`), NULLIF(`new`.`firstWeightUserId`, `old`.`firstWeightUserId`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`secondWeightUserId`, `new`.`secondWeightUserId`), NULLIF(`new`.`secondWeightUserId`, `old`.`secondWeightUserId`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`verifyUserId`, `new`.`verifyUserId`), NULLIF(`new`.`verifyUserId`, `old`.`verifyUserId`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deletedUserId`, `new`.`deletedUserId`), NULLIF(`new`.`deletedUserId`, `old`.`deletedUserId`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `weighingheaders_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`transaction`, `new`.`transaction`), NULLIF(`new`.`transaction`, `old`.`transaction`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`settings_id`, `new`.`settings_id`), NULLIF(`new`.`settings_id`, `old`.`settings_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`RegNumber`, `new`.`RegNumber`), NULLIF(`new`.`RegNumber`, `old`.`RegNumber`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`RegNumber2`, `new`.`RegNumber2`), NULLIF(`new`.`RegNumber2`, `old`.`RegNumber2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`RegNumber3`, `new`.`RegNumber3`), NULLIF(`new`.`RegNumber3`, `old`.`RegNumber3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom1`, `new`.`Custom1`), NULLIF(`new`.`Custom1`, `old`.`Custom1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom2`, `new`.`Custom2`), NULLIF(`new`.`Custom2`, `old`.`Custom2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom3`, `new`.`Custom3`), NULLIF(`new`.`Custom3`, `old`.`Custom3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom4`, `new`.`Custom4`), NULLIF(`new`.`Custom4`, `old`.`Custom4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom5`, `new`.`Custom5`), NULLIF(`new`.`Custom5`, `old`.`Custom5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom6`, `new`.`Custom6`), NULLIF(`new`.`Custom6`, `old`.`Custom6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom7`, `new`.`Custom7`), NULLIF(`new`.`Custom7`, `old`.`Custom7`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom8`, `new`.`Custom8`), NULLIF(`new`.`Custom8`, `old`.`Custom8`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom9`, `new`.`Custom9`), NULLIF(`new`.`Custom9`, `old`.`Custom9`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom10`, `new`.`Custom10`), NULLIF(`new`.`Custom10`, `old`.`Custom10`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`FirstWeight`, `new`.`FirstWeight`), NULLIF(`new`.`FirstWeight`, `old`.`FirstWeight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`SecondWeight`, `new`.`SecondWeight`), NULLIF(`new`.`SecondWeight`, `old`.`SecondWeight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`TotalWeight`, `new`.`TotalWeight`), NULLIF(`new`.`TotalWeight`, `old`.`TotalWeight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`NettWeight`, `new`.`NettWeight`), NULLIF(`new`.`NettWeight`, `old`.`NettWeight`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`businesspartner_id`, `new`.`businesspartner_id`), NULLIF(`new`.`businesspartner_id`, `old`.`businesspartner_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`product_id`, `new`.`product_id`), NULLIF(`new`.`product_id`, `old`.`product_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`grade_id`, `new`.`grade_id`), NULLIF(`new`.`grade_id`, `old`.`grade_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`haulier_id`, `new`.`haulier_id`), NULLIF(`new`.`haulier_id`, `old`.`haulier_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighbridge_id`, `new`.`weighbridge_id`), NULLIF(`new`.`weighbridge_id`, `old`.`weighbridge_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom11`, `new`.`Custom11`), NULLIF(`new`.`Custom11`, `old`.`Custom11`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom12`, `new`.`Custom12`), NULLIF(`new`.`Custom12`, `old`.`Custom12`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom13`, `new`.`Custom13`), NULLIF(`new`.`Custom13`, `old`.`Custom13`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom14`, `new`.`Custom14`), NULLIF(`new`.`Custom14`, `old`.`Custom14`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom15`, `new`.`Custom15`), NULLIF(`new`.`Custom15`, `old`.`Custom15`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom16`, `new`.`Custom16`), NULLIF(`new`.`Custom16`, `old`.`Custom16`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom17`, `new`.`Custom17`), NULLIF(`new`.`Custom17`, `old`.`Custom17`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom18`, `new`.`Custom18`), NULLIF(`new`.`Custom18`, `old`.`Custom18`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom19`, `new`.`Custom19`), NULLIF(`new`.`Custom19`, `old`.`Custom19`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Custom20`, `new`.`Custom20`), NULLIF(`new`.`Custom20`, `old`.`Custom20`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`reason`, `new`.`reason`), NULLIF(`new`.`reason`, `old`.`reason`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`status`, `new`.`status`), NULLIF(`new`.`status`, `old`.`status`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`price`, `new`.`price`), NULLIF(`new`.`price`, `old`.`price`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`moisture_deduction`, `new`.`moisture_deduction`), NULLIF(`new`.`moisture_deduction`, `old`.`moisture_deduction`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`handling_charges`, `new`.`handling_charges`), NULLIF(`new`.`handling_charges`, `old`.`handling_charges`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pallet_id`, `new`.`pallet_id`), NULLIF(`new`.`pallet_id`, `old`.`pallet_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pallet_charges`, `new`.`pallet_charges`), NULLIF(`new`.`pallet_charges`, `old`.`pallet_charges`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`pallet_count`, `new`.`pallet_count`), NULLIF(`new`.`pallet_count`, `old`.`pallet_count`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`tare_id`, `new`.`tare_id`), NULLIF(`new`.`tare_id`, `old`.`tare_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`firstWeightUserId`, `new`.`firstWeightUserId`), NULLIF(`new`.`firstWeightUserId`, `old`.`firstWeightUserId`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`secondWeightUserId`, `new`.`secondWeightUserId`), NULLIF(`new`.`secondWeightUserId`, `old`.`secondWeightUserId`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`verifyUserId`, `new`.`verifyUserId`), NULLIF(`new`.`verifyUserId`, `old`.`verifyUserId`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deletedUserId`, `new`.`deletedUserId`), NULLIF(`new`.`deletedUserId`, `old`.`deletedUserId`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `weighingheaders_tracking`
--

CREATE TABLE `weighingheaders_tracking` (
  `id` binary(16) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `weighingtransactions`
--

CREATE TABLE `weighingtransactions` (
  `id` binary(16) NOT NULL,
  `Status` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `Weight1` decimal(15,2) NOT NULL,
  `Weight2` decimal(15,2) NOT NULL,
  `Weight3` decimal(15,2) NOT NULL,
  `Weight4` decimal(15,2) NOT NULL,
  `Weight5` decimal(15,2) NOT NULL,
  `Weight6` decimal(15,2) NOT NULL,
  `WeightTotal` decimal(15,2) NOT NULL,
  `weighing_header_id` binary(16) DEFAULT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `workstation_id` int(10) DEFAULT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `AxelSetups` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `weighingtransactions`
--
DELIMITER $$
CREATE TRIGGER `weighingtransactions_delete_trigger` AFTER DELETE ON `weighingtransactions` FOR EACH ROW BEGIN
	INSERT INTO `weighingtransactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighingtransactions_insert_trigger` AFTER INSERT ON `weighingtransactions` FOR EACH ROW BEGIN
	INSERT INTO `weighingtransactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `weighingtransactions_update_trigger` AFTER UPDATE ON `weighingtransactions` FOR EACH ROW Begin 
	UPDATE `weighingtransactions_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `weighingtransactions_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`Status`, `new`.`Status`), NULLIF(`new`.`Status`, `old`.`Status`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight1`, `new`.`Weight1`), NULLIF(`new`.`Weight1`, `old`.`Weight1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight2`, `new`.`Weight2`), NULLIF(`new`.`Weight2`, `old`.`Weight2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight3`, `new`.`Weight3`), NULLIF(`new`.`Weight3`, `old`.`Weight3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight4`, `new`.`Weight4`), NULLIF(`new`.`Weight4`, `old`.`Weight4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight5`, `new`.`Weight5`), NULLIF(`new`.`Weight5`, `old`.`Weight5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight6`, `new`.`Weight6`), NULLIF(`new`.`Weight6`, `old`.`Weight6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`WeightTotal`, `new`.`WeightTotal`), NULLIF(`new`.`WeightTotal`, `old`.`WeightTotal`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_header_id`, `new`.`weighing_header_id`), NULLIF(`new`.`weighing_header_id`, `old`.`weighing_header_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`AxelSetups`, `new`.`AxelSetups`), NULLIF(`new`.`AxelSetups`, `old`.`AxelSetups`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `weighingtransactions_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`Status`, `new`.`Status`), NULLIF(`new`.`Status`, `old`.`Status`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight1`, `new`.`Weight1`), NULLIF(`new`.`Weight1`, `old`.`Weight1`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight2`, `new`.`Weight2`), NULLIF(`new`.`Weight2`, `old`.`Weight2`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight3`, `new`.`Weight3`), NULLIF(`new`.`Weight3`, `old`.`Weight3`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight4`, `new`.`Weight4`), NULLIF(`new`.`Weight4`, `old`.`Weight4`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight5`, `new`.`Weight5`), NULLIF(`new`.`Weight5`, `old`.`Weight5`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`Weight6`, `new`.`Weight6`), NULLIF(`new`.`Weight6`, `old`.`Weight6`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`WeightTotal`, `new`.`WeightTotal`), NULLIF(`new`.`WeightTotal`, `old`.`WeightTotal`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`weighing_header_id`, `new`.`weighing_header_id`), NULLIF(`new`.`weighing_header_id`, `old`.`weighing_header_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_id`, `new`.`workstation_id`), NULLIF(`new`.`workstation_id`, `old`.`workstation_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`AxelSetups`, `new`.`AxelSetups`), NULLIF(`new`.`AxelSetups`, `old`.`AxelSetups`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `weighingtransactions_tracking`
--

CREATE TABLE `weighingtransactions_tracking` (
  `id` binary(16) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `workstations`
--

CREATE TABLE `workstations` (
  `id` int(10) UNSIGNED NOT NULL,
  `workstation_type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `workstation_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `workstation_active` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

--
-- Triggers `workstations`
--
DELIMITER $$
CREATE TRIGGER `workstations_delete_trigger` AFTER DELETE ON `workstations` FOR EACH ROW BEGIN
	INSERT INTO `workstations_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		old.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,1
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 1, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `workstations_insert_trigger` AFTER INSERT ON `workstations` FOR EACH ROW BEGIN
	INSERT INTO `workstations_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	VALUES (
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()
	)
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `workstations_update_trigger` AFTER UPDATE ON `workstations` FOR EACH ROW Begin 
	UPDATE `workstations_tracking` 
	SET `update_scope_id` = NULL 
		,`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,`last_change_datetime` = utc_timestamp()
	Where `workstations_tracking`.`id` = new.`id`
	 AND (
	    IFNULL(NULLIF(`old`.`workstation_type`, `new`.`workstation_type`), NULLIF(`new`.`workstation_type`, `old`.`workstation_type`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_name`, `new`.`workstation_name`), NULLIF(`new`.`workstation_name`, `old`.`workstation_name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_active`, `new`.`workstation_active`), NULLIF(`new`.`workstation_active`, `old`.`workstation_active`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
; 
IF (SELECT ROW_COUNT() = 0) THEN 
	INSERT INTO `workstations_tracking` (
		`id`
		,`update_scope_id`
		,`timestamp`
		,`sync_row_is_tombstone`
		,`last_change_datetime`
	) 
	SELECT 
		new.`id`
		,NULL
		,ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000)
		,0
		,utc_timestamp()

	 WHERE (
	    IFNULL(NULLIF(`old`.`workstation_type`, `new`.`workstation_type`), NULLIF(`new`.`workstation_type`, `old`.`workstation_type`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_name`, `new`.`workstation_name`), NULLIF(`new`.`workstation_name`, `old`.`workstation_name`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`workstation_active`, `new`.`workstation_active`), NULLIF(`new`.`workstation_active`, `old`.`workstation_active`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`site_id`, `new`.`site_id`), NULLIF(`new`.`site_id`, `old`.`site_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`company_id`, `new`.`company_id`), NULLIF(`new`.`company_id`, `old`.`company_id`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`updated_at`, `new`.`updated_at`), NULLIF(`new`.`updated_at`, `old`.`updated_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`created_at`, `new`.`created_at`), NULLIF(`new`.`created_at`, `old`.`created_at`)) IS NOT NULL
	 OR IFNULL(NULLIF(`old`.`deleted_at`, `new`.`deleted_at`), NULLIF(`new`.`deleted_at`, `old`.`deleted_at`)) IS NOT NULL
	 ) 
ON DUPLICATE KEY UPDATE
	`update_scope_id` = NULL, 
	`sync_row_is_tombstone` = 0, 
	`timestamp` = ROUND(UNIX_TIMESTAMP(CURRENT_TIMESTAMP(6)) * 10000), 
	`last_change_datetime` = utc_timestamp()
;
END IF;
End
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `workstations_tracking`
--

CREATE TABLE `workstations_tracking` (
  `id` int(11) NOT NULL,
  `update_scope_id` varchar(36) DEFAULT NULL,
  `timestamp` bigint(20) DEFAULT NULL,
  `sync_row_is_tombstone` bit(1) NOT NULL DEFAULT b'0',
  `last_change_datetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `axelsetups`
--
ALTER TABLE `axelsetups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `axelsetups_company_id_foreign` (`company_id`);

--
-- Indexes for table `axelsetups_tracking`
--
ALTER TABLE `axelsetups_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `axletypes`
--
ALTER TABLE `axletypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `axletypes_company_id_foreign` (`company_id`);

--
-- Indexes for table `axletypes_tracking`
--
ALTER TABLE `axletypes_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `businesspartners`
--
ALTER TABLE `businesspartners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businesspartners_company_id_foreign` (`company_id`);

--
-- Indexes for table `businesspartners_tracking`
--
ALTER TABLE `businesspartners_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `cameras`
--
ALTER TABLE `cameras`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cameras_weighbridge_id_foreign` (`weighbridge_id`),
  ADD KEY `cameras_workstation_id_foreign` (`workstation_id`),
  ADD KEY `cameras_site_id_foreign` (`site_id`),
  ADD KEY `cameras_company_id_foreign` (`company_id`);

--
-- Indexes for table `cameras_tracking`
--
ALTER TABLE `cameras_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `companies_tracking`
--
ALTER TABLE `companies_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contracts_tracking`
--
ALTER TABLE `contracts_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contract_transactions`
--
ALTER TABLE `contract_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_weighing_header_id` (`weighing_header_id`);

--
-- Indexes for table `contract_transactions_tracking`
--
ALTER TABLE `contract_transactions_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `errorlog`
--
ALTER TABLE `errorlog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `errorlog_tracking`
--
ALTER TABLE `errorlog_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exceptions`
--
ALTER TABLE `exceptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exceptions_tracking`
--
ALTER TABLE `exceptions_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grades_company_id_foreign` (`company_id`);

--
-- Indexes for table `grades_tracking`
--
ALTER TABLE `grades_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hauliers`
--
ALTER TABLE `hauliers`
  ADD PRIMARY KEY (`id`,`site_id`),
  ADD KEY `hauliers_company_id_foreign` (`company_id`);

--
-- Indexes for table `hauliers_tracking`
--
ALTER TABLE `hauliers_tracking`
  ADD PRIMARY KEY (`id`,`site_id`);

--
-- Indexes for table `pallets`
--
ALTER TABLE `pallets`
  ADD PRIMARY KEY (`pallet_id`);

--
-- Indexes for table `pallets_tracking`
--
ALTER TABLE `pallets_tracking`
  ADD PRIMARY KEY (`pallet_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_company_id_foreign` (`company_id`);

--
-- Indexes for table `products_tracking`
--
ALTER TABLE `products_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reporting`
--
ALTER TABLE `reporting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `reporting_tracking`
--
ALTER TABLE `reporting_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rfid_vehicles`
--
ALTER TABLE `rfid_vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rfid_vehicles_company_id_foreign` (`company_id`);

--
-- Indexes for table `rfid_vehicles_tracking`
--
ALTER TABLE `rfid_vehicles_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `scope_info`
--
ALTER TABLE `scope_info`
  ADD PRIMARY KEY (`sync_scope_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `settings_company_id_foreign` (`company_id`),
  ADD KEY `FK_weighingheader_workstation_id` (`workstation_id`),
  ADD KEY `FK_weighingheader_site_id` (`site_id`);

--
-- Indexes for table `settings_tracking`
--
ALTER TABLE `settings_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sites_company_id_foreign` (`company_id`);

--
-- Indexes for table `sites_tracking`
--
ALTER TABLE `sites_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tares`
--
ALTER TABLE `tares`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tares_tracking`
--
ALTER TABLE `tares_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions_tracking`
--
ALTER TABLE `transactions_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD KEY `users_role_id_foreign` (`role_id`),
  ADD KEY `users_company_id_foreign` (`company_id`),
  ADD KEY `users_site_id_foreign` (`site_id`),
  ADD KEY `users_workstations_id_foreign` (`workstations_id`);

--
-- Indexes for table `users_tracking`
--
ALTER TABLE `users_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usertypes`
--
ALTER TABLE `usertypes`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usertypes_tracking`
--
ALTER TABLE `usertypes_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `weighbridges`
--
ALTER TABLE `weighbridges`
  ADD PRIMARY KEY (`id`),
  ADD KEY `weighbridges_workstation_id_foreign` (`workstation_id`),
  ADD KEY `weighbridges_site_id_foreign` (`site_id`),
  ADD KEY `weighbridges_company_id_foreign` (`company_id`);

--
-- Indexes for table `weighbridges_tracking`
--
ALTER TABLE `weighbridges_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `weighingcameras`
--
ALTER TABLE `weighingcameras`
  ADD PRIMARY KEY (`id`,`site_id`);

--
-- Indexes for table `weighingcameras_old`
--
ALTER TABLE `weighingcameras_old`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `weighingcameras_old_tracking`
--
ALTER TABLE `weighingcameras_old_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `weighingcameras_tracking`
--
ALTER TABLE `weighingcameras_tracking`
  ADD PRIMARY KEY (`id`,`site_id`);

--
-- Indexes for table `weighingheaders`
--
ALTER TABLE `weighingheaders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `weighingheaders_businesspartner_id_foreign` (`businesspartner_id`),
  ADD KEY `weighingheaders_product_id_foreign` (`product_id`),
  ADD KEY `weighingheaders_grade_id_foreign` (`grade_id`),
  ADD KEY `weighingheaders_haulier_id_foreign` (`haulier_id`),
  ADD KEY `weighingheaders_weighbridge_id_foreign` (`weighbridge_id`),
  ADD KEY `weighingheaders_site_id_foreign` (`site_id`),
  ADD KEY `weighingheaders_company_id_foreign` (`company_id`),
  ADD KEY `weighingheaders_pallet_id_foreign` (`pallet_id`),
  ADD KEY `FK_FirstWeightUserWeighingheader` (`firstWeightUserId`),
  ADD KEY `FK_SecondWeightUserWeighingheader` (`secondWeightUserId`),
  ADD KEY `FK_VerifyUserWeighingheader` (`verifyUserId`),
  ADD KEY `FK_DeletedUserWeighingheader` (`deletedUserId`),
  ADD KEY `FK_weighingheaders_workstation_id` (`workstation_id`),
  ADD KEY `INDX_weighingheaders_select` (`deleted_at`,`company_id`,`site_id`,`workstation_id`,`status`);

--
-- Indexes for table `weighingheaders_tracking`
--
ALTER TABLE `weighingheaders_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `weighingtransactions`
--
ALTER TABLE `weighingtransactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `weighingtransactions_site_id_foreign` (`site_id`),
  ADD KEY `weighingtransactions_company_id_foreign` (`company_id`),
  ADD KEY `weighingtransactions_weighing_header_id_foreign` (`weighing_header_id`);

--
-- Indexes for table `weighingtransactions_tracking`
--
ALTER TABLE `weighingtransactions_tracking`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `workstations`
--
ALTER TABLE `workstations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workstations_site_id_foreign` (`site_id`),
  ADD KEY `workstations_company_id_foreign` (`company_id`);

--
-- Indexes for table `workstations_tracking`
--
ALTER TABLE `workstations_tracking`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `axelsetups`
--
ALTER TABLE `axelsetups`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `axletypes`
--
ALTER TABLE `axletypes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `businesspartners`
--
ALTER TABLE `businesspartners`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `cameras`
--
ALTER TABLE `cameras`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contracts`
--
ALTER TABLE `contracts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `contract_transactions`
--
ALTER TABLE `contract_transactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `errorlog`
--
ALTER TABLE `errorlog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exceptions`
--
ALTER TABLE `exceptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hauliers`
--
ALTER TABLE `hauliers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pallets`
--
ALTER TABLE `pallets`
  MODIFY `pallet_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reporting`
--
ALTER TABLE `reporting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rfid_vehicles`
--
ALTER TABLE `rfid_vehicles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sites`
--
ALTER TABLE `sites`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tares`
--
ALTER TABLE `tares`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usertypes`
--
ALTER TABLE `usertypes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weighbridges`
--
ALTER TABLE `weighbridges`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weighingcameras_old`
--
ALTER TABLE `weighingcameras_old`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `workstations`
--
ALTER TABLE `workstations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `businesspartners`
--
ALTER TABLE `businesspartners`
  ADD CONSTRAINT `businesspartners_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Constraints for table `cameras`
--
ALTER TABLE `cameras`
  ADD CONSTRAINT `cameras_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `cameras_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `cameras_weighbridge_id_foreign` FOREIGN KEY (`weighbridge_id`) REFERENCES `weighbridges` (`id`),
  ADD CONSTRAINT `cameras_workstation_id_foreign` FOREIGN KEY (`workstation_id`) REFERENCES `workstations` (`id`);

--
-- Constraints for table `contract_transactions`
--
ALTER TABLE `contract_transactions`
  ADD CONSTRAINT `FK_weighing_header_id` FOREIGN KEY (`weighing_header_id`) REFERENCES `weighingheaders` (`id`);

--
-- Constraints for table `hauliers`
--
ALTER TABLE `hauliers`
  ADD CONSTRAINT `hauliers_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Constraints for table `rfid_vehicles`
--
ALTER TABLE `rfid_vehicles`
  ADD CONSTRAINT `rfid_vehicles_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Constraints for table `sites`
--
ALTER TABLE `sites`
  ADD CONSTRAINT `sites_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `usertypes` (`id`),
  ADD CONSTRAINT `users_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `users_workstations_id_foreign` FOREIGN KEY (`workstations_id`) REFERENCES `workstations` (`id`);

--
-- Constraints for table `weighbridges`
--
ALTER TABLE `weighbridges`
  ADD CONSTRAINT `weighbridges_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `weighbridges_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `weighbridges_workstation_id_foreign` FOREIGN KEY (`workstation_id`) REFERENCES `workstations` (`id`);

--
-- Constraints for table `weighingheaders`
--
ALTER TABLE `weighingheaders`
  ADD CONSTRAINT `FK_DeletedUserWeighingheader` FOREIGN KEY (`deletedUserId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_FirstWeightUserWeighingheader` FOREIGN KEY (`firstWeightUserId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_SecondWeightUserWeighingheader` FOREIGN KEY (`secondWeightUserId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_VerifyUserWeighingheader` FOREIGN KEY (`verifyUserId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `FK_weighingheaders_workstation_id` FOREIGN KEY (`workstation_id`) REFERENCES `workstations` (`id`),
  ADD CONSTRAINT `weighingheaders_businesspartner_id_foreign` FOREIGN KEY (`businesspartner_id`) REFERENCES `businesspartners` (`id`),
  ADD CONSTRAINT `weighingheaders_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `weighingheaders_grade_id_foreign` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  ADD CONSTRAINT `weighingheaders_haulier_id_foreign` FOREIGN KEY (`haulier_id`) REFERENCES `hauliers` (`id`),
  ADD CONSTRAINT `weighingheaders_pallet_id_foreign` FOREIGN KEY (`pallet_id`) REFERENCES `pallets` (`pallet_id`),
  ADD CONSTRAINT `weighingheaders_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `weighingheaders_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `weighingheaders_weighbridge_id_foreign` FOREIGN KEY (`weighbridge_id`) REFERENCES `weighbridges` (`id`);

--
-- Constraints for table `weighingtransactions`
--
ALTER TABLE `weighingtransactions`
  ADD CONSTRAINT `weighingtransactions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `weighingtransactions_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  ADD CONSTRAINT `weighingtransactions_weighing_header_id_foreign` FOREIGN KEY (`weighing_header_id`) REFERENCES `weighingheaders` (`id`);

--
-- Constraints for table `workstations`
--
ALTER TABLE `workstations`
  ADD CONSTRAINT `workstations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  ADD CONSTRAINT `workstations_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
