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
  `level` varchar(50) NOT NULL DEFAULT 'Beginner',
  `audio_file` varchar(255) NOT NULL,
  `play_count` int NOT NULL DEFAULT '0',
  `point` int NOT NULL DEFAULT '0',
  `played_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`audio_file`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audio_logs`
--

LOCK TABLES `audio_logs` WRITE;
/*!40000 ALTER TABLE `audio_logs` DISABLE KEYS */;
INSERT INTO `audio_logs` VALUES (1,'윈터','견습 딜리터','media/battle.mp3',1,10,'2025-02-09 21:23:46'),(1,'윈터','견습 딜리터','media/forest.mp3',1,10,'2025-02-09 21:24:28');
/*!40000 ALTER TABLE `audio_logs` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_level_after_insert` AFTER INSERT ON `audio_logs` FOR EACH ROW BEGIN
    UPDATE audio_logs AS a
    JOIN (
        SELECT user_id, SUM(point) AS total_points
        FROM audio_logs
        GROUP BY user_id
    ) AS b ON a.user_id = b.user_id
    SET a.level = CASE
        WHEN b.total_points >= 30000 THEN '수석 딜리터 4'
        WHEN b.total_points >= 25000 THEN '수석 딜리터 3'
        WHEN b.total_points >= 20000 THEN '수석 딜리터 2'
        WHEN b.total_points >= 15000 THEN '수석 딜리터 1'
        WHEN b.total_points >= 11000 THEN '고등 딜리터 3'
        WHEN b.total_points >= 9500 THEN '고등 딜리터 2'
        WHEN b.total_points >= 8000 THEN '고등 딜리터 1'
        WHEN b.total_points >= 6000 THEN '중등 딜리터 3'
        WHEN b.total_points >= 5000 THEN '중등 딜리터 2'
        WHEN b.total_points >= 4000 THEN '중등 딜리터 1'
        WHEN b.total_points >= 2500 THEN '초등 딜리터 6'
        WHEN b.total_points >= 2000 THEN '초등 딜리터 5'
        WHEN b.total_points >= 1500 THEN '초등 딜리터 4'
        WHEN b.total_points >= 1000 THEN '초등 딜리터 3'
        WHEN b.total_points >= 500 THEN '초등 딜리터 2'
        WHEN b.total_points >= 100 THEN '초등 딜리터 1'
        ELSE '견습 딜리터'
    END;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_total_points` AFTER INSERT ON `audio_logs` FOR EACH ROW BEGIN
    -- `total_points` 테이블에 user_id가 없으면 추가, 있으면 업데이트
    INSERT INTO total_points (user_id, user_name, total_points)
    VALUES (NEW.user_id, NEW.user_name, NEW.point)
    ON DUPLICATE KEY UPDATE total_points = total_points + NEW.point;

    -- 총 포인트에 따라 레벨 업데이트
    UPDATE total_points
    SET level = CASE
        WHEN total_points >= 30000 THEN '수석 딜리터 4'
        WHEN total_points >= 25000 THEN '수석 딜리터 3'
        WHEN total_points >= 20000 THEN '수석 딜리터 2'
        WHEN total_points >= 15000 THEN '수석 딜리터 1'
        WHEN total_points >= 11000 THEN '고등 딜리터 3'
        WHEN total_points >= 9500 THEN '고등 딜리터 2'
        WHEN total_points >= 8000 THEN '고등 딜리터 1'
        WHEN total_points >= 6000 THEN '중등 딜리터 3'
        WHEN total_points >= 5000 THEN '중등 딜리터 2'
        WHEN total_points >= 4000 THEN '중등 딜리터 1'
        WHEN total_points >= 2500 THEN '초등 딜리터 6'
        WHEN total_points >= 2000 THEN '초등 딜리터 5'
        WHEN total_points >= 1500 THEN '초등 딜리터 4'
        WHEN total_points >= 1000 THEN '초등 딜리터 3'
        WHEN total_points >= 500 THEN '초등 딜리터 2'
        WHEN total_points >= 100 THEN '초등 딜리터 1'
        ELSE '견습 딜리터'
    END
    WHERE user_id = NEW.user_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

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
INSERT INTO `total_points` VALUES (1,'윈터','견습 딜리터',20);
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

-- Dump completed on 2025-03-13 16:32:45
