export function ok(res, message, data) {
  return res.status(200).json({ success: true, message, data });
}

export function created(res, message, data) {
  return res.status(201).json({ success: true, message, data });
}

export function noContent(res) {
  return res.status(204).send();
}
