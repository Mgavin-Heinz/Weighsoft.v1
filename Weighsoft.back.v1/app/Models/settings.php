<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * App\Models\settings
 *
 * @property int $id
 * @property string $name
 * @property string $haulier
 * @property string $stored_tares
 * @property string|null $numberplate_1
 * @property string $numberplate_recognition
 * @property string|null $numberplate_2
 * @property string|null $numberplate_3
 * @property string $business_partner
 * @property string|null $use_product_list
 * @property string $type_of_weighing
 * @property string $first_can_axel
 * @property string $second_can_axel
 * @property string $goods_type
 * @property string $print_ticket
 * @property string $reprint
 * @property string $custom_fields
 * @property string $user_defined_input1
 * @property string|null $user_defined_name1
 * @property mixed|null $user_defined_val1
 * @property string $user_defined_rep1
 * @property string|null $user_defined_input2
 * @property string|null $user_defined_name2
 * @property mixed $user_defined_val2
 * @property string $user_defined_rep2
 * @property string|null $user_defined_input3
 * @property string|null $user_defined_name3
 * @property mixed $user_defined_val3
 * @property string $user_defined_rep3
 * @property string|null $user_defined_input4
 * @property string|null $user_defined_name4
 * @property mixed $user_defined_val4
 * @property string $user_defined_rep4
 * @property string|null $user_defined_input5
 * @property string|null $user_defined_name5
 * @property mixed $user_defined_val5
 * @property string $user_defined_rep5
 * @property string|null $user_defined_input6
 * @property string|null $user_defined_name6
 * @property mixed $user_defined_val6
 * @property string $user_defined_rep6
 * @property string|null $user_defined_input7
 * @property string|null $user_defined_name7
 * @property mixed $user_defined_val7
 * @property string $user_defined_rep7
 * @property string|null $user_defined_input8
 * @property string|null $user_defined_name8
 * @property mixed $user_defined_val8
 * @property string $user_defined_rep8
 * @property string|null $user_defined_input9
 * @property string|null $user_defined_name9
 * @property mixed $user_defined_val9
 * @property string $user_defined_rep9
 * @property string|null $user_defined_input10
 * @property string|null $user_defined_name10
 * @property mixed $user_defined_val10
 * @property string $user_defined_rep10
 * @property string $AS_400_path
 * @property string $export_AS400
 * @property string $silo_verification
 * @property string $use_cameras
 * @property string $display_cameras
 * @property string $print_cameras_on_ticket
 * @property string $ticket_header
 * @property mixed|null $display_custom_header_img
 * @property mixed $ticket_footer
 * @property mixed|null $display_custom_footer_img
 * @property int $company_id
 * @property \Illuminate\Support\Carbon $updated_at
 * @property \Illuminate\Support\Carbon $created_at
 * @property string|null $user_defined_input11
 * @property string|null $user_defined_name11
 * @property mixed|null $user_defined_val11
 * @property string|null $user_defined_rep11
 * @property string|null $user_defined_input12
 * @property string|null $user_defined_name12
 * @property mixed|null $user_defined_val12
 * @property string|null $user_defined_rep12
 * @property string|null $user_defined_input13
 * @property string|null $user_defined_name13
 * @property mixed|null $user_defined_val13
 * @property string|null $user_defined_rep13
 * @property string|null $user_defined_input14
 * @property string|null $user_defined_name14
 * @property mixed|null $user_defined_val14
 * @property string|null $user_defined_rep14
 * @property string|null $user_defined_input15
 * @property string|null $user_defined_name15
 * @property mixed|null $user_defined_val15
 * @property string|null $user_defined_rep15
 * @property string|null $user_defined_input16
 * @property string|null $user_defined_name16
 * @property mixed|null $user_defined_val16
 * @property string|null $user_defined_rep16
 * @property string|null $user_defined_input17
 * @property string|null $user_defined_name17
 * @property mixed|null $user_defined_val17
 * @property string|null $user_defined_rep17
 * @property string|null $user_defined_input18
 * @property string|null $user_defined_name18
 * @property mixed|null $user_defined_val18
 * @property string|null $user_defined_rep18
 * @property string|null $user_defined_input19
 * @property string|null $user_defined_name19
 * @property mixed|null $user_defined_val19
 * @property string|null $user_defined_rep19
 * @property string|null $user_defined_input20
 * @property string|null $user_defined_name20
 * @property mixed|null $user_defined_val20
 * @property string|null $user_defined_rep20
 * @property string|null $invoice_enabled
 * @property string|null $contract_enabled
 * @property string|null $moisture_deduction_level
 * @property string|null $prefix
 * @property string $enable_moisture
 * @property string $enable_handling
 * @property string|null $pallet_enabled
 * @property string|null $tares_enabled
 * @property string|null $measure_type
 * @property string|null $deduct_flow
 * @method static \Illuminate\Database\Eloquent\Builder|settings newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|settings newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|settings query()
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereAS400Path($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereBusinessPartner($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereContractEnabled($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereCustomFields($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereDisplayCameras($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereDisplayCustomFooterImg($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereDisplayCustomHeaderImg($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereEnableHandling($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereEnableMoisture($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereExportAS400($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereFirstCanAxel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereGoodsType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereHaulier($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereInvoiceEnabled($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereMoistureDeductionLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereNumberplate1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereNumberplate2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereNumberplate3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereNumberplateRecognition($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings wherePalletEnabled($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings wherePrefix($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings wherePrintCamerasOnTicket($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings wherePrintTicket($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereReprint($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereSecondCanAxel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereSiloVerification($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereStoredTares($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereTaresEnabled($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereTicketFooter($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereTicketHeader($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereTypeOfWeighing($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUseCameras($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUseProductList($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput10($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput11($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput12($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput13($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput14($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput15($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput16($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput17($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput18($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput19($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput20($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput5($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput6($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput7($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput8($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedInput9($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName10($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName11($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName12($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName13($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName14($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName15($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName16($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName17($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName18($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName19($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName20($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName5($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName6($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName7($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName8($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedName9($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep10($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep11($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep12($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep13($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep14($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep15($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep16($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep17($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep18($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep19($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep20($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep5($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep6($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep7($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep8($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedRep9($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal1($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal10($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal11($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal12($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal13($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal14($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal15($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal16($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal17($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal18($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal19($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal2($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal20($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal3($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal4($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal5($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal6($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal7($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal8($value)
 * @method static \Illuminate\Database\Eloquent\Builder|settings whereUserDefinedVal9($value)
 * @mixin \Eloquent
 */
class settings extends Model
{
    protected $fillable = ['name','haulier','use_product_list','stored_tares','numberplate_1','numberplate_recognition',
        'numberplate_2','numberplate_3','business_partner','type_of_weighing','first_can_axel',
        'second_can_axel','goods_type','print_ticket','ticket_template','reprint','custom_fields','user_defined_input1','user_defined_name1','user_defined_val1',
        'user_defined_rep1','user_defined_input2','user_defined_name2','user_defined_val2','user_defined_rep2','user_defined_input3','user_defined_name3',
        'user_defined_val3','user_defined_rep3','user_defined_input4','user_defined_name4','user_defined_val4','user_defined_rep4','user_defined_input5',
        'user_defined_name5','user_defined_val5','user_defined_rep5','user_defined_input6','user_defined_name6','user_defined_val6','user_defined_rep6',
        'user_defined_input7','user_defined_name7','user_defined_val7','user_defined_rep7','user_defined_input8','user_defined_name8','user_defined_val8',
        'user_defined_rep8','user_defined_input9','user_defined_name9','user_defined_val9','user_defined_rep9','user_defined_input10',
        'user_defined_name10','user_defined_val10','user_defined_rep10','user_defined_input11',
        'user_defined_name11','user_defined_val11','user_defined_rep11','user_defined_input12',
        'user_defined_name12','user_defined_val12','user_defined_rep12','user_defined_input13',
        'user_defined_name13','user_defined_val13','user_defined_rep13','user_defined_input14',
        'user_defined_name14','user_defined_val14','user_defined_rep14','user_defined_input15',
        'user_defined_name15','user_defined_val15','user_defined_rep15','user_defined_input16',
        'user_defined_name16','user_defined_val16','user_defined_rep16','user_defined_input17',
        'user_defined_name17','user_defined_val17','user_defined_rep17','user_defined_input18',
        'user_defined_name18','user_defined_val18','user_defined_rep18','user_defined_input19',
        'user_defined_name19','user_defined_val19','user_defined_rep19','user_defined_input20',
        'user_defined_name20','user_defined_val20','user_defined_rep20','export_AS400', 'AS_400_path', 
        'silo_verification','use_cameras','display_cameras','print_cameras_on_ticket','ticket_header',
        'display_custom_header_img','ticket_footer','display_custom_footer_img','company_id',
        'enable_moisture','enable_handling','invoice_enabled','contract_enabled','moisture_deduction_level',
        'prefix','pallet_enabled','tares_enabled'];
}
