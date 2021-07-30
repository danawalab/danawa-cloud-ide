DROP DATABASE IF EXISTS react;

CREATE DATABASE react;
USE react;

create table CONTAINER_INFO 
  (
  	user_id varchar(32) not null,
  	container_id varchar(100) not null primary key,
	container_nm varchar(32) not null,
	note_txt varchar(500) not null,
	tmlt_dtl varchar(32) not null,
	stack_cd varchar(32) not null,
	addpkg_cd_1 varchar(32) not null,
    port varchar(32) not null,
  	update_dts datetime,
 	insert_dts datetime
  );

create table USER_INFO 
(
	user_id varchar(32) not null primary key,
	user_pwd varchar(200) not null,
	serialkey varchar(200),
	update_dts datetime,
    insert_dts datetime
);