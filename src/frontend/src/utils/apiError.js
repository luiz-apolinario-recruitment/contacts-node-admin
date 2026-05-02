export async function readApiError(response, fallbackMessage) {
  const data = await response.json().catch(() => ({}));

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map(error => error.msg).filter(Boolean).join(' ');
  }

  return data.message || data.error || fallbackMessage;
}
