<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PayProcessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $selected = $this->input('methods');

        if ($selected == 1) {
            return [
                'phone' => 'required|min:8',
            ];
        } elseif ($selected == 2) {
            return [
                'direction' => 'required|min:8',
            ];
        }

        return [];
    }
}