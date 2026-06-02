-- MariaDB dump 10.18  Distrib 10.4.17-MariaDB, for Linux (armv8l)
--
-- Host: localhost    Database: weighsoft
-- ------------------------------------------------------
-- Server version	10.4.17-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `axelsetups`
--

DROP TABLE IF EXISTS `axelsetups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `axelsetups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
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
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `axelsetups_company_id_foreign` (`company_id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `axletypes`
--

DROP TABLE IF EXISTS `axletypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `axletypes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Single_Steering` int(11) NOT NULL DEFAULT 0,
  `Double_Steering` int(11) NOT NULL DEFAULT 0,
  `Triple_Steering` int(11) NOT NULL DEFAULT 0,
  `Single_Non_Steering` int(11) NOT NULL DEFAULT 0,
  `Double_Non_Steering` int(11) NOT NULL DEFAULT 0,
  `Triple_Non_Steering` int(11) NOT NULL DEFAULT 0,
  `Double_Single_Non_Steering` int(11) NOT NULL,
  `Double_Double_Non_Steering` int(11) NOT NULL,
  `Double_Triple_Non_Steering` int(11) NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `Custom_1` int(11) NOT NULL DEFAULT 0,
  `Custom_2` int(11) NOT NULL DEFAULT 0,
  `Custom_3` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `axletypes_company_id_foreign` (`company_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `businesspartners`
--

DROP TABLE IF EXISTS `businesspartners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `businesspartners` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `site_id` int(10) NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `vat_nr` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `street` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `suburb` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `city` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `postal_code` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `businesspartners_company_id_foreign` (`company_id`),
  CONSTRAINT `businesspartners_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=648 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `cameras`
--

DROP TABLE IF EXISTS `cameras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cameras` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `pn_recog` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `ip_address` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `camera_active` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weighbridge_id` int(10) unsigned NOT NULL,
  `workstation_id` int(10) unsigned NOT NULL,
  `site_id` int(10) unsigned NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cameras_weighbridge_id_foreign` (`weighbridge_id`),
  KEY `cameras_workstation_id_foreign` (`workstation_id`),
  KEY `cameras_site_id_foreign` (`site_id`),
  KEY `cameras_company_id_foreign` (`company_id`),
  CONSTRAINT `cameras_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `cameras_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  CONSTRAINT `cameras_weighbridge_id_foreign` FOREIGN KEY (`weighbridge_id`) REFERENCES `weighbridges` (`id`),
  CONSTRAINT `cameras_workstation_id_foreign` FOREIGN KEY (`workstation_id`) REFERENCES `workstations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `companies` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
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
  `delete_transaction_flag` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `terms` varchar(4000) COLLATE utf8_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contract_transactions`
--

DROP TABLE IF EXISTS `contract_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contract_transactions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `contract_id` int(11) NOT NULL,
  `amount` double(11,2) NOT NULL,
  `weighing_header_id` binary(16) DEFAULT NULL,
  `site_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `company_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_weighing_header_id` (`weighing_header_id`),
  CONSTRAINT `FK_weighing_header_id` FOREIGN KEY (`weighing_header_id`) REFERENCES `weighingheaders` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1953 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contracts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `linked_contact_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=146 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `errorlog`
--

DROP TABLE IF EXISTS `errorlog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `errorlog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8_bin NOT NULL,
  `description` varchar(2000) COLLATE utf8_bin NOT NULL,
  `jsondata` varchar(2000) COLLATE utf8_bin NOT NULL,
  `comment` varchar(255) COLLATE utf8_bin NOT NULL,
  `weighbridge_id` int(11) NOT NULL,
  `workstation_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `exceptions`
--

DROP TABLE IF EXISTS `exceptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `exceptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8_bin NOT NULL,
  `description` varchar(2000) COLLATE utf8_bin NOT NULL,
  `jsondata` varchar(2000) COLLATE utf8_bin NOT NULL,
  `comment` varchar(255) COLLATE utf8_bin NOT NULL,
  `weighbridge_id` int(11) NOT NULL,
  `workstation_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grades` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `grades_company_id_foreign` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `hauliers`
--

DROP TABLE IF EXISTS `hauliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hauliers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `site_id` int(10) NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`site_id`),
  KEY `hauliers_company_id_foreign` (`company_id`),
  CONSTRAINT `hauliers_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=313 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `migration` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `pallets`
--

DROP TABLE IF EXISTS `pallets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pallets` (
  `pallet_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pallet_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `amount` decimal(8,2) NOT NULL,
  `company_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`pallet_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `products` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `vat` decimal(11,2) DEFAULT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `sale_price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `products_company_id_foreign` (`company_id`),
  CONSTRAINT `products_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=206 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reporting`
--

DROP TABLE IF EXISTS `reporting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reporting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rfid_vehicles`
--

DROP TABLE IF EXISTS `rfid_vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rfid_vehicles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `registration_number` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `rfid` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rfid_vehicles_company_id_foreign` (`company_id`),
  CONSTRAINT `rfid_vehicles_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `settings` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
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
  `company_id` int(10) unsigned NOT NULL,
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
  `site_id` int(10) unsigned NOT NULL,
  `workstation_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `settings_company_id_foreign` (`company_id`),
  KEY `FK_weighingheader_workstation_id` (`workstation_id`),
  KEY `FK_weighingheader_site_id` (`site_id`)
) ENGINE=MyISAM AUTO_INCREMENT=23 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sites`
--

DROP TABLE IF EXISTS `sites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sites` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `site_type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `site_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `finger_active` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `override_silo` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `site_active` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `custom_header_text` blob NOT NULL,
  `custom_footer_text` blob NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sites_company_id_foreign` (`company_id`),
  CONSTRAINT `sites_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `tares`
--

DROP TABLE IF EXISTS `tares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tares` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `registration_no` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `weight` decimal(8,2) NOT NULL,
  `company_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `expiry_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `weighbridge_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `transactions`
--

DROP TABLE IF EXISTS `transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `current_id` int(11) NOT NULL,
  `settings_id` int(11) NOT NULL,
  `site_id` int(11) NOT NULL,
  `company_id` int(11) NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8 COLLATE=utf8_bin;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `lastname` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `contact_num` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `password` varchar(60) COLLATE utf8_unicode_ci NOT NULL,
  `role_id` int(10) unsigned DEFAULT NULL,
  `site_id` int(10) unsigned DEFAULT NULL,
  `workstations_id` int(10) unsigned DEFAULT NULL,
  `company_id` int(10) unsigned DEFAULT NULL,
  `token` varchar(255) COLLATE utf8_unicode_ci DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `fingerprint` text COLLATE utf8_unicode_ci NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_id_foreign` (`role_id`),
  KEY `users_company_id_foreign` (`company_id`),
  KEY `users_site_id_foreign` (`site_id`),
  KEY `users_workstations_id_foreign` (`workstations_id`),
  CONSTRAINT `users_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `usertypes` (`id`),
  CONSTRAINT `users_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  CONSTRAINT `users_workstations_id_foreign` FOREIGN KEY (`workstations_id`) REFERENCES `workstations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usertypes`
--

DROP TABLE IF EXISTS `usertypes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usertypes` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
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
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `weighbridges`
--

DROP TABLE IF EXISTS `weighbridges`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weighbridges` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
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
  `workstation_id` int(10) unsigned NOT NULL,
  `site_id` int(10) unsigned NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `weighing_transaction_flag` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `weighbridges_workstation_id_foreign` (`workstation_id`),
  KEY `weighbridges_site_id_foreign` (`site_id`),
  KEY `weighbridges_company_id_foreign` (`company_id`),
  CONSTRAINT `weighbridges_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `weighbridges_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  CONSTRAINT `weighbridges_workstation_id_foreign` FOREIGN KEY (`workstation_id`) REFERENCES `workstations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `weighingcameras`
--

DROP TABLE IF EXISTS `weighingcameras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weighingcameras` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `base64` text NOT NULL,
  `isnpr` varchar(255) NOT NULL,
  `weighing_transaction_id` int(11) NOT NULL,
  `site_id` int(10) unsigned NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`,`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `weighingcameras_old`
--

DROP TABLE IF EXISTS `weighingcameras_old`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `weighingcameras_old` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `base64` text NOT NULL,
  `isnpr` varchar(255) NOT NULL,
  `weighing_transaction_id` int(11) NOT NULL,
  `site_id` int(10) unsigned NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `weighingheaders`
--

DROP TABLE IF EXISTS `weighingheaders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `businesspartner_id` int(10) unsigned DEFAULT NULL,
  `product_id` int(10) unsigned DEFAULT NULL,
  `grade_id` int(10) unsigned DEFAULT NULL,
  `haulier_id` int(10) unsigned DEFAULT NULL,
  `weighbridge_id` int(10) unsigned NOT NULL,
  `site_id` int(10) unsigned NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
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
  `pallet_id` int(10) unsigned DEFAULT NULL,
  `pallet_charges` decimal(8,2) DEFAULT 0.00,
  `pallet_count` int(11) DEFAULT 0,
  `tare_id` int(11) DEFAULT NULL,
  `firstWeightUserId` int(10) unsigned NOT NULL DEFAULT 21,
  `secondWeightUserId` int(10) unsigned DEFAULT NULL,
  `verifyUserId` int(10) unsigned DEFAULT NULL,
  `deletedUserId` int(10) unsigned DEFAULT NULL,
  `workstation_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `weighingheaders_businesspartner_id_foreign` (`businesspartner_id`),
  KEY `weighingheaders_product_id_foreign` (`product_id`),
  KEY `weighingheaders_grade_id_foreign` (`grade_id`),
  KEY `weighingheaders_haulier_id_foreign` (`haulier_id`),
  KEY `weighingheaders_weighbridge_id_foreign` (`weighbridge_id`),
  KEY `weighingheaders_site_id_foreign` (`site_id`),
  KEY `weighingheaders_company_id_foreign` (`company_id`),
  KEY `weighingheaders_pallet_id_foreign` (`pallet_id`),
  KEY `FK_FirstWeightUserWeighingheader` (`firstWeightUserId`),
  KEY `FK_SecondWeightUserWeighingheader` (`secondWeightUserId`),
  KEY `FK_VerifyUserWeighingheader` (`verifyUserId`),
  KEY `FK_DeletedUserWeighingheader` (`deletedUserId`),
  KEY `FK_weighingheaders_workstation_id` (`workstation_id`),
  KEY `INDX_weighingheaders_select` (`deleted_at`,`company_id`,`site_id`,`workstation_id`,`status`),
  CONSTRAINT `FK_DeletedUserWeighingheader` FOREIGN KEY (`deletedUserId`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_FirstWeightUserWeighingheader` FOREIGN KEY (`firstWeightUserId`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_SecondWeightUserWeighingheader` FOREIGN KEY (`secondWeightUserId`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_VerifyUserWeighingheader` FOREIGN KEY (`verifyUserId`) REFERENCES `users` (`id`),
  CONSTRAINT `FK_weighingheaders_workstation_id` FOREIGN KEY (`workstation_id`) REFERENCES `workstations` (`id`),
  CONSTRAINT `weighingheaders_businesspartner_id_foreign` FOREIGN KEY (`businesspartner_id`) REFERENCES `businesspartners` (`id`),
  CONSTRAINT `weighingheaders_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `weighingheaders_grade_id_foreign` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  CONSTRAINT `weighingheaders_haulier_id_foreign` FOREIGN KEY (`haulier_id`) REFERENCES `hauliers` (`id`),
  CONSTRAINT `weighingheaders_pallet_id_foreign` FOREIGN KEY (`pallet_id`) REFERENCES `pallets` (`pallet_id`),
  CONSTRAINT `weighingheaders_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `weighingheaders_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  CONSTRAINT `weighingheaders_weighbridge_id_foreign` FOREIGN KEY (`weighbridge_id`) REFERENCES `weighbridges` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `weighingtransactions`
--

DROP TABLE IF EXISTS `weighingtransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `site_id` int(10) unsigned NOT NULL,
  `workstation_id` int(10) DEFAULT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  `AxelSetups` int(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `weighingtransactions_site_id_foreign` (`site_id`),
  KEY `weighingtransactions_company_id_foreign` (`company_id`),
  KEY `weighingtransactions_weighing_header_id_foreign` (`weighing_header_id`),
  CONSTRAINT `weighingtransactions_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `weighingtransactions_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`),
  CONSTRAINT `weighingtransactions_weighing_header_id_foreign` FOREIGN KEY (`weighing_header_id`) REFERENCES `weighingheaders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `workstations`
--

DROP TABLE IF EXISTS `workstations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `workstations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `workstation_type` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `workstation_name` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `workstation_active` varchar(255) COLLATE utf8_unicode_ci NOT NULL,
  `site_id` int(10) unsigned NOT NULL,
  `company_id` int(10) unsigned NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `workstations_site_id_foreign` (`site_id`),
  KEY `workstations_company_id_foreign` (`company_id`),
  CONSTRAINT `workstations_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `workstations_site_id_foreign` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-05-21  8:18:28
