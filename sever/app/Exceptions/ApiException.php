<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    public function __construct(
        string $message = 'An error occurred.',
        int $code = 400,
        private readonly array $errors = [],
    ) {
        parent::__construct($message, $code);
    }

    public function getErrors(): array { return $this->errors; }
    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'errors'  => $this->errors,
        ], $this->getCode());
    }
}
