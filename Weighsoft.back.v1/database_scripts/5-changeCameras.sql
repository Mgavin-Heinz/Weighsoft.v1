delimiter $$

create procedure set_weighingcamera_uuid()
begin
    declare `_rollback` bool default 0;
    declare continue handler for sqlexception set `_rollback` = 1;

    start transaction;

    alter table weighingcameras modify id binary(16);
    alter table weighingcameras modify weighing_transaction_id binary(16);
    alter table weighingcameras modify base64 mediumblob;

    if `_rollback` then
        rollback;
        select 'Changes were rolled back due to an error' as message;
    else
        commit;
        select 'Changes successfully committed' as message;
    end if;
end$$

delimiter ;