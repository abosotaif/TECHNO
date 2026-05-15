<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

/**
 * Renders all API exceptions in a single, predictable JSON envelope:
 *
 * {
 *   "error": {
 *     "code": "validation_error",
 *     "message": "The given data was invalid.",
 *     "details": { "field": ["..."] }   // optional, only when relevant
 *   }
 * }
 */
class ApiExceptionRenderer
{
    public function render(Throwable $e, Request $request): JsonResponse
    {
        if ($e instanceof ValidationException) {
            return $this->json('validation_error', $e->getMessage(), 422, $e->errors());
        }

        if ($e instanceof AuthenticationException) {
            return $this->json('unauthenticated', 'Authentication required.', 401);
        }

        if ($e instanceof AuthorizationException) {
            return $this->json('forbidden', $e->getMessage() ?: 'You are not allowed to perform this action.', 403);
        }

        if ($e instanceof ModelNotFoundException) {
            return $this->json('not_found', 'Resource not found.', 404);
        }

        if ($e instanceof HttpExceptionInterface) {
            $status = $e->getStatusCode();

            return $this->json(
                $this->statusToCode($status),
                $e->getMessage() ?: $this->statusToMessage($status),
                $status,
            );
        }

        $debug = (bool) config('app.debug');

        return $this->json(
            'server_error',
            $debug ? $e->getMessage() : 'Something went wrong.',
            500,
            $debug ? ['trace' => collect($e->getTrace())->take(15)->all()] : null,
        );
    }

    private function json(string $code, string $message, int $status, ?array $details = null): JsonResponse
    {
        $payload = [
            'error' => [
                'code'    => $code,
                'message' => $message,
            ],
        ];

        if ($details !== null) {
            $payload['error']['details'] = $details;
        }

        return response()->json($payload, $status);
    }

    private function statusToCode(int $status): string
    {
        return match ($status) {
            400 => 'bad_request',
            401 => 'unauthenticated',
            403 => 'forbidden',
            404 => 'not_found',
            405 => 'method_not_allowed',
            409 => 'conflict',
            419 => 'csrf_mismatch',
            422 => 'validation_error',
            429 => 'too_many_requests',
            default => $status >= 500 ? 'server_error' : 'http_error',
        };
    }

    private function statusToMessage(int $status): string
    {
        return match ($status) {
            400 => 'Bad request.',
            401 => 'Authentication required.',
            403 => 'Forbidden.',
            404 => 'Not found.',
            405 => 'Method not allowed.',
            409 => 'Conflict.',
            419 => 'CSRF token mismatch.',
            422 => 'Unprocessable entity.',
            429 => 'Too many requests.',
            default => $status >= 500 ? 'Server error.' : 'HTTP error.',
        };
    }
}
