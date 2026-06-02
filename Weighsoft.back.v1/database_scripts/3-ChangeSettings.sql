delimiter $$

create procedure add_fields_to_settings()
begin
    declare `_rollback` bool default 0;
    declare continue handler for sqlexception set `_rollback` = 1;

    start transaction;

    alter table
        settings
        add
            site_id int(10) unsigned not null;

    alter table
        settings
        add
            workstation_id int(10) unsigned not null;

    update
        settings
    set
        workstation_id = (select id from workstations where workstations.company_id = settings.company_id limit 1),
        site_id = (select id from sites where sites.company_id = settings.company_id limit 1)
    where workstation_id is null;

    alter table settings add constraint FK_weighingheader_workstation_id foreign key (workstation_id) references workstations(id);
    alter table settings add constraint FK_weighingheader_site_id foreign key (site_id) references sites(id);

    if `_rollback` then
		rollback;
		select 'Changes were rolled back due to an error' as message;
	else
		commit;
	    select 'Changes successfully committed' as message;
	end if;
end$$

delimiter ;

