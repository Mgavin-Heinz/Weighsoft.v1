-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: db
-- Generation Time: Apr 01, 2026 at 12:41 PM
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
  `sale_price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  `measure_type` char(10) COLLATE utf8_unicode_ci DEFAULT 'KG',
  `deduct_flow` char(10) COLLATE utf8_unicode_ci DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  `measure_type` char(10) COLLATE utf8_unicode_ci DEFAULT 'KG',
  `deduct_flow` char(10) COLLATE utf8_unicode_ci DEFAULT NULL,
  `decimals` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `weighingcameras`
--

CREATE TABLE `weighingcameras` (
  `id` int(11) NOT NULL,
  `base64` text NOT NULL,
  `isnpr` varchar(255) NOT NULL,
  `weighing_transaction_id` int(11) NOT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `print_camera` varchar(255) NOT NULL DEFAULT 'true',
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

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

-- --------------------------------------------------------

--
-- Table structure for table `weighingheaders`
--

CREATE TABLE `weighingheaders` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` binary(16) NOT NULL,
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
  `workstation_id` int(10) UNSIGNED NOT NULL,
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
  `moisture_threshold` decimal(8,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `weighingtransactions`
--

CREATE TABLE `weighingtransactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `uuid` binary(16) NOT NULL,
  `Status` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `Weight1` decimal(15,2) NOT NULL,
  `Weight2` decimal(15,2) NOT NULL,
  `Weight3` decimal(15,2) NOT NULL,
  `Weight4` decimal(15,2) NOT NULL,
  `Weight5` decimal(15,2) NOT NULL,
  `Weight6` decimal(15,2) NOT NULL,
  `WeightTotal` decimal(15,2) NOT NULL,
  `weighing_header_id` int(10) UNSIGNED DEFAULT NULL,
  `weighing_header_uuid` binary(16) DEFAULT NULL,
  `site_id` int(10) UNSIGNED NOT NULL,
  `workstation_id` int(10) DEFAULT NULL,
  `company_id` int(10) UNSIGNED NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `AxelSetups` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

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
-- Indexes for dumped tables
--

--
-- Indexes for table `axelsetups`
--
ALTER TABLE `axelsetups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `axelsetups_company_id_foreign` (`company_id`);

--
-- Indexes for table `axletypes`
--
ALTER TABLE `axletypes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `axletypes_company_id_foreign` (`company_id`);

--
-- Indexes for table `businesspartners`
--
ALTER TABLE `businesspartners`
  ADD PRIMARY KEY (`id`),
  ADD KEY `businesspartners_company_id_foreign` (`company_id`);

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
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contracts`
--
ALTER TABLE `contracts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `contract_transactions`
--
ALTER TABLE `contract_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `FK_weighing_header_id` (`weighing_header_id`);

--
-- Indexes for table `errorlog`
--
ALTER TABLE `errorlog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exceptions`
--
ALTER TABLE `exceptions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD KEY `grades_company_id_foreign` (`company_id`);

--
-- Indexes for table `hauliers`
--
ALTER TABLE `hauliers`
  ADD PRIMARY KEY (`id`,`site_id`),
  ADD KEY `hauliers_company_id_foreign` (`company_id`);

--
-- Indexes for table `pallets`
--
ALTER TABLE `pallets`
  ADD PRIMARY KEY (`pallet_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_company_id_foreign` (`company_id`);

--
-- Indexes for table `reporting`
--
ALTER TABLE `reporting`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rfid_vehicles`
--
ALTER TABLE `rfid_vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rfid_vehicles_company_id_foreign` (`company_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `settings_company_id_foreign` (`company_id`);

--
-- Indexes for table `sites`
--
ALTER TABLE `sites`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sites_company_id_foreign` (`company_id`);

--
-- Indexes for table `tares`
--
ALTER TABLE `tares`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
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
-- Indexes for table `usertypes`
--
ALTER TABLE `usertypes`
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
-- Indexes for table `weighingheaders`
--
ALTER TABLE `weighingheaders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_weighingheaders_uuid` (`uuid`),
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
-- Indexes for table `weighingtransactions`
--
ALTER TABLE `weighingtransactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_weighingtransactions_uuid` (`uuid`),
  ADD KEY `weighingtransactions_weighing_header_id_foreign` (`weighing_header_id`),
  ADD KEY `weighingtransactions_site_id_foreign` (`site_id`),
  ADD KEY `weighingtransactions_company_id_foreign` (`company_id`),
  ADD KEY `idx_weighingtransactions_weighing_header_uuid` (`weighing_header_uuid`);

--
-- Indexes for table `workstations`
--
ALTER TABLE `workstations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `workstations_site_id_foreign` (`site_id`),
  ADD KEY `workstations_company_id_foreign` (`company_id`);

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
-- AUTO_INCREMENT for table `weighingcameras`
--
ALTER TABLE `weighingcameras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weighingcameras_old`
--
ALTER TABLE `weighingcameras_old`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weighingheaders`
--
ALTER TABLE `weighingheaders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `weighingtransactions`
--
ALTER TABLE `weighingtransactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  ADD CONSTRAINT `FK_weighing_header_id` FOREIGN KEY (`weighing_header_id`) REFERENCES `weighingheaders` (`uuid`);

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
  ADD CONSTRAINT `fk_weighingtransactions_weighing_header_uuid` FOREIGN KEY (`weighing_header_uuid`) REFERENCES `weighingheaders` (`uuid`),
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
