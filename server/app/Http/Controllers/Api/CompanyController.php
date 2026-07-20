<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyController extends Controller
{
    use ApiResponse;

    public function settings(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        if (! $company) {
            return $this->error('No company found.', 404);
        }

        return $this->success([
            'id'          => $company->id,
            'name'        => $company->name,
            'slug'        => $company->slug,
            'booking_url' => $company->booking_url,
            'status'      => $company->status,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $company = $request->user()->company;

        if (! $company) {
            return $this->error('No company found.', 404);
        }

        $validator = Validator::make($request->all(), [
            'booking_url' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return $this->error($validator->errors()->first(), 422);
        }

        $company->update($validator->validated());

        return $this->success([
            'id'          => $company->id,
            'name'        => $company->name,
            'slug'        => $company->slug,
            'booking_url' => $company->booking_url,
            'status'      => $company->status,
        ], 'Booking URL updated successfully.');
    }
}
