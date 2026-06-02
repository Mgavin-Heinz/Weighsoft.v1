<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSettingsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Check if the table already exists
        if (!Schema::hasTable('settings')) {
            Schema::create('settings', function (Blueprint $table) {
                $table->id(); // Primary key
                $table->string('name');
                $table->string('haulier');
                $table->string('stored_tares');
                $table->string('numberplate_1')->nullable();
                $table->string('numberplate_recognition');
                $table->string('numberplate_2')->nullable();
                $table->string('numberplate_3')->nullable();
                $table->string('business_partner');
                $table->string('use_product_list')->nullable();
                $table->string('type_of_weighing')->default('0.00');
                $table->string('first_can_axel');
                $table->string('second_can_axel')->default('0.00');
                $table->string('goods_type');
                $table->string('print_ticket');
                $table->string('ticket_template')->default('normal');
                $table->string('reprint');
                $table->string('custom_fields');
                $table->text('user_defined_input1');
                $table->string('user_defined_name1')->nullable();
                $table->binary('user_defined_val1')->nullable();
                $table->string('user_defined_rep1');
                
                // Loop-based definition for user-defined inputs 2–20
                for ($i = 2; $i <= 20; $i++) {
                    $table->string("user_defined_input$i")->nullable();
                    $table->string("user_defined_name$i")->nullable();
                    $table->binary("user_defined_val$i")->nullable();
                    $table->string("user_defined_rep$i")->nullable();
                }
    
                $table->text('AS_400_path');
                $table->string('export_AS400');
                $table->string('silo_verification');
                $table->string('use_cameras');
                $table->string('display_cameras');
                $table->string('print_cameras_on_ticket');
                $table->string('ticket_header', 15);
                $table->binary('display_custom_header_img')->nullable();
                $table->string('ticket_footer', 15);
                $table->binary('display_custom_footer_img')->nullable();
                $table->unsignedBigInteger('company_id')->index();
                $table->unsignedBigInteger('site_id')->index();
                $table->unsignedBigInteger('workstation_id')->index();
                $table->string('2nd_weighing');
                $table->string('invoice_enabled', 25)->nullable();
                $table->string('contract_enabled', 25)->nullable();
                $table->decimal('moisture_deduction_level', 8, 2)->nullable()->default(0.00);
                $table->string('prefix', 10)->nullable();
                $table->char('enable_moisture', 10);
                $table->char('enable_handling', 10);
                $table->string('pallet_enabled')->nullable();
                $table->string('tares_enabled')->nullable();
                $table->timestamps();
            });
        } else {
            // Add columns if they do not exist
            Schema::table('settings', function (Blueprint $table) {
                if (!Schema::hasColumn('settings', 'name')) {
                    $table->string('name');
                }
                if (!Schema::hasColumn('settings', 'haulier')) {
                    $table->string('haulier');
                }
                if (!Schema::hasColumn('settings', 'stored_tares')) {
                    $table->string('stored_tares');
                }
                if (!Schema::hasColumn('settings', 'numberplate_1')) {
                    $table->string('numberplate_1')->nullable();
                }
                if (!Schema::hasColumn('settings', 'numberplate_recognition')) {
                    $table->string('numberplate_recognition');
                }
                if (!Schema::hasColumn('settings', 'numberplate_2')) {
                    $table->string('numberplate_2')->nullable();
                }
                if (!Schema::hasColumn('settings', 'numberplate_3')) {
                    $table->string('numberplate_3')->nullable();
                }
                if (!Schema::hasColumn('settings', 'business_partner')) {
                    $table->string('business_partner');
                }
                if (!Schema::hasColumn('settings', 'use_product_list')) {
                    $table->string('use_product_list')->nullable();
                }
                if (!Schema::hasColumn('settings', 'type_of_weighing')) {
                    $table->string('type_of_weighing');
                }
                if (!Schema::hasColumn('settings', 'first_can_axel')) {
                    $table->string('first_can_axel');
                }
                if (!Schema::hasColumn('settings', 'second_can_axel')) {
                    $table->string('second_can_axel');
                }
                if (!Schema::hasColumn('settings', 'goods_type')) {
                    $table->string('goods_type');
                }
                if (!Schema::hasColumn('settings', 'print_ticket')) {
                    $table->string('print_ticket');
                }
                if (!Schema::hasColumn('settings', 'ticket_template')) {
                    $table->string('ticket_template')->default('normal');
                }
                if (!Schema::hasColumn('settings', 'reprint')) {
                    $table->string('reprint');
                }
                if (!Schema::hasColumn('settings', 'custom_fields')) {
                    $table->string('custom_fields');
                }
                if (!Schema::hasColumn('settings', 'user_defined_input1')) {
                    $table->string('user_defined_input1');
                }
                if (!Schema::hasColumn('settings', 'user_defined_name1')) {
                    $table->string('user_defined_name1')->nullable();
                }
                if (!Schema::hasColumn('settings', 'user_defined_val1')) {
                    $table->json('user_defined_val1')->nullable();
                }
                if (!Schema::hasColumn('settings', 'user_defined_rep1')) {
                    $table->string('user_defined_rep1');
                }
                // Repeat the above for user_defined_input2 to user_defined_input20, user_defined_name, user_defined_val, and user_defined_rep
                if (!Schema::hasColumn('settings', 'AS_400_path')) {
                    $table->string('AS_400_path');
                }
                if (!Schema::hasColumn('settings', 'export_AS400')) {
                    $table->string('export_AS400');
                }
                if (!Schema::hasColumn('settings', 'silo_verification')) {
                    $table->string('silo_verification');
                }
                if (!Schema::hasColumn('settings', 'use_cameras')) {
                    $table->string('use_cameras');
                }
                if (!Schema::hasColumn('settings', 'display_cameras')) {
                    $table->string('display_cameras');
                }
                if (!Schema::hasColumn('settings', 'print_cameras_on_ticket')) {
                    $table->string('print_cameras_on_ticket');
                }
                if (!Schema::hasColumn('settings', 'ticket_header')) {
                    $table->string('ticket_header');
                }
                if (!Schema::hasColumn('settings', 'display_custom_header_img')) {
                    $table->json('display_custom_header_img')->nullable();
                }
                if (!Schema::hasColumn('settings', 'ticket_footer')) {
                    $table->json('ticket_footer')->nullable();
                }
                if (!Schema::hasColumn('settings', 'display_custom_footer_img')) {
                    $table->json('display_custom_footer_img')->nullable();
                }
                if (!Schema::hasColumn('settings', 'company_id')) {
                    $table->foreignId('company_id')->constrained()->onDelete('cascade');
                }
                if (!Schema::hasColumn('settings', 'user_defined_input11')) {
                    $table->string('user_defined_input11')->nullable();
                }
                if (!Schema::hasColumn('settings', 'user_defined_name11')) {
                    $table->string('user_defined_name11')->nullable();
                }
                if (!Schema::hasColumn('settings', 'user_defined_val11')) {
                    $table->json('user_defined_val11')->nullable();
                }
                if (!Schema::hasColumn('settings', 'user_defined_rep11')) {
                    $table->string('user_defined_rep11')->nullable();
                }
                // Continue for user_defined_input12 to user_defined_input20, user_defined_name, user_defined_val, and user_defined_rep
                if (!Schema::hasColumn('settings', 'invoice_enabled')) {
                    $table->string('invoice_enabled')->nullable();
                }
                if (!Schema::hasColumn('settings', 'contract_enabled')) {
                    $table->string('contract_enabled')->nullable();
                }
                if (!Schema::hasColumn('settings', 'moisture_deduction_level')) {
                    $table->string('moisture_deduction_level')->nullable();
                }
                if (!Schema::hasColumn('settings', 'prefix')) {
                    $table->string('prefix')->nullable();
                }
                if (!Schema::hasColumn('settings', 'enable_moisture')) {
                    $table->string('enable_moisture');
                }
                if (!Schema::hasColumn('settings', 'enable_handling')) {
                    $table->string('enable_handling');
                }
                if (!Schema::hasColumn('settings', 'pallet_enabled')) {
                    $table->string('pallet_enabled')->nullable();
                }
                if (!Schema::hasColumn('settings', 'tares_enabled')) {
                    $table->string('tares_enabled')->nullable();
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('settings');
    }
}
