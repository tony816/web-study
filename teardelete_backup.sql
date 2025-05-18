-- MySQL dump 10.13  Distrib 9.0.1, for macos14.7 (x86_64)
--
-- Host: localhost    Database: teardelete_db
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `audio_logs`
--

DROP TABLE IF EXISTS `audio_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audio_logs` (
  `user_id` int NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `level` varchar(255) NOT NULL DEFAULT '견습 딜리터',
  `audio_file` varchar(255) NOT NULL,
  `play_count` int NOT NULL DEFAULT '0',
  `point` int NOT NULL DEFAULT '0',
  `played_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `title` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`audio_file`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio_logs`
--

LOCK TABLES `audio_logs` WRITE;
/*!40000 ALTER TABLE `audio_logs` DISABLE KEYS */;
INSERT INTO `audio_logs` VALUES (1,'윈터','🌱 견습 딜리터','media/battle.mp3',3,30,'2025-05-18 21:21:30','첫 번째 제목');
/*!40000 ALTER TABLE `audio_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `audio_logs_sorted`
--

DROP TABLE IF EXISTS `audio_logs_sorted`;
/*!50001 DROP VIEW IF EXISTS `audio_logs_sorted`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `audio_logs_sorted` AS SELECT 
 1 AS `user_id`,
 1 AS `user_name`,
 1 AS `audio_file`,
 1 AS `played_at`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `total_points`
--

DROP TABLE IF EXISTS `total_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `total_points` (
  `user_id` int NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `level` varchar(255) NOT NULL DEFAULT '견습 딜리터',
  `total_points` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `total_points`
--

LOCK TABLES `total_points` WRITE;
/*!40000 ALTER TABLE `total_points` DISABLE KEYS */;
INSERT INTO `total_points` VALUES (1,'윈터','견습 딜리터',30);
/*!40000 ALTER TABLE `total_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `gender` varchar(10) NOT NULL,
  `birthdate` date NOT NULL,
  `age` int DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `subscription_period` int NOT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'윈터','여성','2001-01-01',24,'$2b$10$YaZ/MxjHzPJzl3vo89umK.8Y7WKKNxOAPfXMfPl3aqYz4ozq494sK','010-1111-1111',180,'winter11@naver.com');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `audio_logs_sorted`
--

/*!50001 DROP VIEW IF EXISTS `audio_logs_sorted`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `audio_logs_sorted` AS select `audio_logs`.`user_id` AS `user_id`,`audio_logs`.`user_name` AS `user_name`,`audio_logs`.`audio_file` AS `audio_file`,`audio_logs`.`played_at` AS `played_at` from `audio_logs` order by `audio_logs`.`user_id`,`audio_logs`.`user_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-18 21:46:23
