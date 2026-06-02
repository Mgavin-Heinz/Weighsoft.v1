delimiter $$

create procedure `add_email_scheduling`()
begin
    declare `_rollback` bool default 0;
    declare continue handler for sqlexception set `_rollback` = 1;

    start transaction;

    alter table
       reporting
    add
        email varchar(255) DEFAULT NULL;

    alter table
        reporting
    add
        schedule varchar(20) DEFAULT NULL;

    alter table
        reporting
    add
        last_report_on datetime default null;

    if `_rollback` then
        rollback;
        select 'Changes were rolled back due to an error' as message;
    else
        commit;
        select 'Changes successfully committed' as message;
    end if;
end$$

delimiter ;