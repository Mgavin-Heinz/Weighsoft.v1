<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAxelSetupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('axelsetups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('steering');
            $table->integer('steering_max');
            $table->string('axel_1');
            $table->integer('axel_1_max');
            $table->string('axel_2')->nullable();
            $table->integer('axel_2_max')->nullable();
            $table->string('axel_3')->nullable();
            $table->integer('axel_3_max')->nullable();
            $table->string('axel_4')->nullable();
            $table->integer('axel_4_max')->nullable();
            $table->integer('vehicle_max');
            $table->foreignId('company_id')->constrained('companies'); // Assuming a 'companies' table exists
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('axelsetups');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAxleTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('axletypes', function (Blueprint $table) {
            $table->id();
            $table->integer('Single_Steering');
            $table->integer('Double_Steering');
            $table->integer('Triple_Steering');
            $table->integer('Single_Non_Steering');
            $table->integer('Double_Non_Steering');
            $table->integer('Triple_Non_Steering');
            $table->integer('Double_Single_Non_Steering');
            $table->integer('Double_Double_Non_Steering');
            $table->integer('Double_Triple_Non_Steering');
            $table->integer('Custom_1');
            $table->integer('Custom_2');
            $table->integer('Custom_3');
            $table->foreignId('company_id')->constrained('companies'); // Assuming a 'companies' table exists
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('axletypes');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBusinessPartnersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('businesspartners', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('name');
            $table->string('vat_nr')->nullable();
            $table->string('street')->nullable();
            $table->string('suburb')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code')->nullable();
            $table->foreignId('site_id')->constrained('sites');  // Assuming a 'sites' table exists
            $table->foreignId('company_id')->constrained('companies');  // Assuming a 'companies' table exists
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('businesspartners');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCamerasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cameras', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('pn_recog');
            $table->string('ip_address');
            $table->boolean('camera_active');
            $table->foreignId('weighbridge_id')->constrained('weighbridges');  // Assuming a 'weighbridges' table exists
            $table->foreignId('workstation_id')->constrained('workstations');  // Assuming a 'workstations' table exists
            $table->foreignId('site_id')->constrained('sites');  // Assuming a 'sites' table exists
            $table->foreignId('company_id')->constrained('companies');  // Assuming a 'companies' table exists
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('cameras');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('registered_name');
            $table->string('tel');
            $table->string('fax')->nullable();
            $table->string('email');
            $table->string('registration_number');
            $table->string('vat_nr');
            $table->string('contact_person');
            $table->string('cell');
            $table->string('street');
            $table->string('suburb1');
            $table->string('city1');
            $table->string('postal_code1');
            $table->string('po_box')->nullable();
            $table->string('suburb2')->nullable();
            $table->string('city2')->nullable();
            $table->string('postal_code2')->nullable();
            $table->text('terms')->nullable();
            $table->boolean('display_custom_logo_img')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('companies');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContractsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedBigInteger('businesspartner_id');
            $table->date('expiry_date');
            $table->string('direction');
            $table->decimal('price', 15, 2)->nullable();
            $table->decimal('amount', 15, 2);
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('company_id');
            $table->text('reason')->nullable();
            $table->unsignedBigInteger('linked_contact_id')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraints
            $table->foreign('businesspartner_id')->references('id')->on('businesspartners')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('linked_contact_id')->references('id')->on('contracts')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contracts');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContractTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('contract_transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('contract_id');
            $table->decimal('amount', 15, 2);
            $table->unsignedBigInteger('weighing_header_id')->nullable();
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('company_id');
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraints
            $table->foreign('contract_id')->references('id')->on('contracts')->onDelete('cascade');
            $table->foreign('weighing_header_id')->references('id')->on('weighingheaders')->onDelete('set null');
            $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('contract_transactions');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateErrorlogTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('errorlog', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->text('description');
            $table->json('jsondata');
            $table->text('comment')->nullable();
            $table->unsignedBigInteger('weighbridge_id');
            $table->unsignedBigInteger('workstation_id');
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('company_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('weighbridge_id')->references('id')->on('weighbridges')->onDelete('cascade');
            $table->foreign('workstation_id')->references('id')->on('workstations')->onDelete('cascade');
            $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('errorlog');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateExceptionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('exceptions', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->text('description');
            $table->json('jsondata');
            $table->text('comment')->nullable();
            $table->unsignedBigInteger('weighbridge_id');
            $table->unsignedBigInteger('workstation_id');
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('company_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('weighbridge_id')->references('id')->on('weighbridges')->onDelete('cascade');
            $table->foreign('workstation_id')->references('id')->on('workstations')->onDelete('cascade');
            $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('exceptions');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateHauliersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('hauliers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('company_id');
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraints
            $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('hauliers');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePalletsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('pallets', function (Blueprint $table) {
            $table->id('pallet_id');
            $table->string('pallet_name');
            $table->string('amount');
            $table->unsignedBigInteger('company_id');
            $table->unsignedBigInteger('site_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
            $table->foreign('site_id')->references('id')->on('sites')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('pallets');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateProductsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code');
            $table->string('name');
            $table->string('vat')->nullable();
            $table->unsignedBigInteger('company_id');
            $table->string('purchase_price')->nullable();
            $table->string('sale_price')->nullable();
            $table->string('grades_enabled')->nullable();
            $table->string('grades')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraints
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReportingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('reporting', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('description')->nullable();
            $table->string('jsondata')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('email')->nullable();
            $table->string('schedule')->nullable();
            $table->string('last_report_on')->nullable();
            $table->string('show_deleted')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Foreign key constraints
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('reporting');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRfidVehiclesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('rfid_vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('registration_number');
            $table->string('rfid');
            $table->unsignedBigInteger('company_id')->nullable();
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('rfid_vehicles');
    }
}


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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('haulier');
            $table->string('stored_tares');
            $table->string('numberplate_1')->nullable();
            $table->string('numberplate_recognition');
            $table->string('numberplate_2')->nullable();
            $table->string('numberplate_3')->nullable();
            $table->string('business_partner');
            $table->string('use_product_list')->nullable();
            $table->string('type_of_weighing');
            $table->string('first_can_axel');
            $table->string('second_can_axel');
            $table->string('goods_type');
            $table->string('print_ticket');
            $table->string('reprint');
            $table->string('custom_fields');
            $table->string('user_defined_input1');
            $table->string('user_defined_name1')->nullable();
            $table->json('user_defined_val1')->nullable();
            $table->string('user_defined_rep1');
            $table->string('user_defined_input2')->nullable();
            $table->string('user_defined_name2')->nullable();
            $table->json('user_defined_val2')->nullable();
            $table->string('user_defined_rep2');
            $table->string('user_defined_input3')->nullable();
            $table->string('user_defined_name3')->nullable();
            $table->json('user_defined_val3')->nullable();
            $table->string('user_defined_rep3');
            $table->string('user_defined_input4')->nullable();
            $table->string('user_defined_name4')->nullable();
            $table->json('user_defined_val4')->nullable();
            $table->string('user_defined_rep4');
            $table->string('user_defined_input5')->nullable();
            $table->string('user_defined_name5')->nullable();
            $table->json('user_defined_val5')->nullable();
            $table->string('user_defined_rep5');
            $table->string('user_defined_input6')->nullable();
            $table->string('user_defined_name6')->nullable();
            $table->json('user_defined_val6')->nullable();
            $table->string('user_defined_rep6');
            $table->string('user_defined_input7')->nullable();
            $table->string('user_defined_name7')->nullable();
            $table->json('user_defined_val7')->nullable();
            $table->string('user_defined_rep7');
            $table->string('user_defined_input8')->nullable();
            $table->string('user_defined_name8')->nullable();
            $table->json('user_defined_val8')->nullable();
            $table->string('user_defined_rep8');
            $table->string('user_defined_input9')->nullable();
            $table->string('user_defined_name9')->nullable();
            $table->json('user_defined_val9')->nullable();
            $table->string('user_defined_rep9');
            $table->string('user_defined_input10')->nullable();
            $table->string('user_defined_name10')->nullable();
            $table->json('user_defined_val10')->nullable();
            $table->string('user_defined_rep10');
            $table->string('AS_400_path');
            $table->string('export_AS400');
            $table->string('silo_verification');
            $table->string('use_cameras');
            $table->string('display_cameras');
            $table->string('print_cameras_on_ticket');
            $table->string('ticket_header');
            $table->json('display_custom_header_img')->nullable();
            $table->json('ticket_footer')->nullable();
            $table->json('display_custom_footer_img')->nullable();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->string('user_defined_input11')->nullable();
            $table->string('user_defined_name11')->nullable();
            $table->json('user_defined_val11')->nullable();
            $table->string('user_defined_rep11')->nullable();
            $table->string('user_defined_input12')->nullable();
            $table->string('user_defined_name12')->nullable();
            $table->json('user_defined_val12')->nullable();
            $table->string('user_defined_rep12')->nullable();
            $table->string('user_defined_input13')->nullable();
            $table->string('user_defined_name13')->nullable();
            $table->json('user_defined_val13')->nullable();
            $table->string('user_defined_rep13')->nullable();
            $table->string('user_defined_input14')->nullable();
            $table->string('user_defined_name14')->nullable();
            $table->json('user_defined_val14')->nullable();
            $table->string('user_defined_rep14')->nullable();
            $table->string('user_defined_input15')->nullable();
            $table->string('user_defined_name15')->nullable();
            $table->json('user_defined_val15')->nullable();
            $table->string('user_defined_rep15')->nullable();
            $table->string('user_defined_input16')->nullable();
            $table->string('user_defined_name16')->nullable();
            $table->json('user_defined_val16')->nullable();
            $table->string('user_defined_rep16')->nullable();
            $table->string('user_defined_input17')->nullable();
            $table->string('user_defined_name17')->nullable();
            $table->json('user_defined_val17')->nullable();
            $table->string('user_defined_rep17')->nullable();
            $table->string('user_defined_input18')->nullable();
            $table->string('user_defined_name18')->nullable();
            $table->json('user_defined_val18')->nullable();
            $table->string('user_defined_rep18')->nullable();
            $table->string('user_defined_input19')->nullable();
            $table->string('user_defined_name19')->nullable();
            $table->json('user_defined_val19')->nullable();
            $table->string('user_defined_rep19')->nullable();
            $table->string('user_defined_input20')->nullable();
            $table->string('user_defined_name20')->nullable();
            $table->json('user_defined_val20')->nullable();
            $table->string('user_defined_rep20')->nullable();
            $table->string('invoice_enabled')->nullable();
            $table->string('contract_enabled')->nullable();
            $table->string('moisture_deduction_level')->nullable();
            $table->string('prefix')->nullable();
            $table->string('enable_moisture');
            $table->string('enable_handling');
            $table->string('pallet_enabled')->nullable();
            $table->string('tares_enabled')->nullable();
            $table->string('measure_type')->nullable();
            $table->string('deduct_flow')->nullable();
        });
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

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSitesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('sites', function (Blueprint $table) {
            $table->id();
            $table->string('site_type');
            $table->string('site_name');
            $table->string('finger_active')->nullable();
            $table->string('override_silo')->nullable();
            $table->string('site_active');
            $table->json('custom_header_text')->nullable();
            $table->json('custom_footer_text')->nullable();
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            $table->softDeletes();
            $table->string('measure_type')->nullable();
            $table->string('deduct_flow')->nullable();
            $table->integer('decimals')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('sites');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTaresTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tares', function (Blueprint $table) {
            $table->id();
            $table->string('registration_no');
            $table->string('weight');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->foreignId('site_id')->constrained()->onDelete('cascade');
            $table->string('expiry_date');
            $table->foreignId('weighbridge_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('tares');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('current_id')->constrained()->onDelete('cascade');
            $table->foreignId('settings_id')->constrained()->onDelete('cascade');
            $table->foreignId('weighbridge_id')->constrained()->onDelete('cascade');
            $table->foreignId('workstation_id')->constrained()->onDelete('cascade');
            $table->foreignId('site_id')->constrained()->onDelete('cascade');
            $table->foreignId('company_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('transactions');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('firstname');
            $table->string('lastname');
            $table->string('contact_num');
            $table->string('email')->unique();
            $table->string('password');
            $table->foreignId('role_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('site_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('workstations_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('company_id')->nullable()->constrained()->onDelete('set null');
            $table->string('token')->nullable();
            $table->string('fingerprint');
            $table->softDeletes(); // For the deleted_at column
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserTypesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('usertypes', function (Blueprint $table) {
            $table->id();
            $table->string('usertypes');
            $table->string('level')->nullable();
            $table->string('companies');
            $table->string('sites');
            $table->string('workstations');
            $table->string('weighbridges')->nullable();
            $table->string('cameras');
            $table->string('weigh_types')->nullable();
            $table->string('weighing');
            $table->string('verify');
            $table->string('reprint');
            $table->string('business_partner');
            $table->string('products');
            $table->string('hauliers');
            $table->string('stored_tares')->nullable();
            $table->string('rfid_vehicle')->nullable();
            $table->string('axel_types')->nullable();
            $table->string('axel_settings')->nullable();
            $table->string('transaction_report')->nullable();
            $table->string('exception_report')->nullable();
            $table->string('users')->nullable();
            $table->string('user_types')->nullable();
            $table->string('delete_transaction_flag');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('usertypes');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeighbridgesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('weighbridges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('ip_address');
            $table->string('code');
            $table->string('port_num');
            $table->string('scale');
            $table->string('remote_display');
            $table->string('baud_rate');
            $table->string('data_bits');
            $table->string('parity');
            $table->string('stop_bits');
            $table->string('weight_reg');
            $table->string('weight_sep')->nullable();
            $table->string('weight_num_amt')->nullable();
            $table->string('weight_special')->nullable();
            $table->string('decimal_places');
            $table->string('stable_samples');
            $table->string('manual');
            $table->string('in_reverse');
            $table->float('weight');
            $table->unsignedBigInteger('workstation_id');
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('company_id');
            $table->string('weighing_transaction_flag');
            $table->timestamps();
            $table->softDeletes(); // Enables soft deletes
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('weighbridges');
    }
}


<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeighingCamerasTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('weighingcameras', function (Blueprint $table) {
            $table->id();
            $table->string('base64');
            $table->string('isnpr');
            $table->unsignedBigInteger('weighing_transaction_id');
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('company_id');
            $table->timestamps();
            $table->softDeletes(); // Enables soft deletes
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('weighingcameras');
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeighingHeadersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('weighingheaders', function (Blueprint $table) {
            $table->string('id')->primary(); // Using string as the key type, set as primary key
            $table->string('transaction')->nullable();
            $table->unsignedBigInteger('settings_id')->nullable();
            $table->string('RegNumber')->nullable();
            $table->string('RegNumber2')->nullable();
            $table->string('RegNumber3')->nullable();
            $table->string('Custom1')->nullable();
            $table->string('Custom2')->nullable();
            $table->string('Custom3')->nullable();
            $table->string('Custom4')->nullable();
            $table->string('Custom5')->nullable();
            $table->string('Custom6')->nullable();
            $table->string('Custom7')->nullable();
            $table->string('Custom8')->nullable();
            $table->string('Custom9')->nullable();
            $table->string('Custom10')->nullable();
            $table->string('Custom11')->nullable();
            $table->string('Custom12')->nullable();
            $table->string('Custom13')->nullable();
            $table->string('Custom14')->nullable();
            $table->string('Custom15')->nullable();
            $table->string('Custom16')->nullable();
            $table->string('Custom17')->nullable();
            $table->string('Custom18')->nullable();
            $table->string('Custom19')->nullable();
            $table->string('Custom20')->nullable();
            $table->float('FirstWeight')->nullable();
            $table->float('SecondWeight')->nullable();
            $table->float('TotalWeight')->nullable();
            $table->integer('NettWeight')->nullable();
            $table->unsignedBigInteger('businesspartner_id')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->unsignedBigInteger('grade_id')->nullable();
            $table->string('grades')->nullable();
            $table->unsignedBigInteger('haulier_id')->nullable();
            $table->unsignedBigInteger('weighbridge_id');
            $table->unsignedBigInteger('site_id');
            $table->unsignedBigInteger('company_id');
            $table->string('reason')->default('')->nullable();
            $table->string('status')->default('')->nullable();
            $table->string('price')->nullable();
            $table->string('moisture_deduction')->nullable();
            $table->string('handling_charges')->nullable();
            $table->unsignedBigInteger('pallet_id')->nullable();
            $table->string('pallet_charges')->nullable();
            $table->integer('pallet_count')->nullable();
            $table->unsignedBigInteger('tare_id')->nullable();
            $table->unsignedBigInteger('firstWeightUserId');
            $table->unsignedBigInteger('secondWeightUserId')->nullable();
            $table->unsignedBigInteger('verifyUserId')->nullable();
            $table->unsignedBigInteger('deletedUserId')->nullable();
            $table->unsignedBigInteger('workstation_id');
            $table->float('moisture_threshold')->nullable();
            $table->float('moistureCoefficient')->nullable();
            $table->float('moistureWeight')->nullable();
            $table->float('handlingWeight')->nullable();
            $table->timestamps();
            $table->softDeletes(); // Enables soft deletes
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('weighingheaders');
    }
}


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWeighingTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('weighingtransactions', function (Blueprint $table) {
            $table->string('id')->primary(); // Assuming id is a string and primary key
            $table->string('Status');
            $table->string('Weight1');
            $table->string('Weight2');
            $table->string('Weight3');
            $table->string('Weight4');
            $table->string('Weight5');
            $table->string('Weight6');
            $table->string('WeightTotal');
            $table->string('weighing_header_id')->nullable(); // Nullable as per model definition
            $table->unsignedInteger('site_id');
            $table->unsignedInteger('workstation_id')->nullable(); // Nullable as per model definition
            $table->unsignedInteger('company_id');
            $table->unsignedInteger('AxelSetups')->nullable(); // Nullable as per model definition
            $table->timestamps(); // This will create 'created_at' and 'updated_at' columns
            $table->softDeletes(); // This will create 'deleted_at' column for soft deletes
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('weighingtransactions');
    }
}


use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateWorkStationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('workstations', function (Blueprint $table) {
            $table->id(); // Auto-incrementing primary key (bigint)
            $table->string('workstation_type');
            $table->string('workstation_name');
            $table->string('workstation_active');
            $table->unsignedInteger('site_id');
            $table->unsignedInteger('company_id');
            $table->timestamps(); // Creates 'created_at' and 'updated_at' columns
            $table->softDeletes(); // Creates 'deleted_at' column for soft deletes
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('workstations');
    }
}
