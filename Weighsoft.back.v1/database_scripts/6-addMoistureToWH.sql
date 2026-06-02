
alter table weighingheaders add column moisture_threshold decimal(8,2) default null;

update weighingheaders wh set moisture_threshold = (select s.moisture_deduction_level from settings s where s.id = wh.settings_id);