import { http } from "@/api/http";

function unwrap(res) {
  const payload = res?.data;
  if (!payload?.success) {
    const message = payload?.message || "Request failed";
    const errors = payload?.errors || [];
    const err = new Error(message);
    err.errors = errors;
    throw err;
  }
  return payload.data;
}

export const recipeIngredientsApi = {
  async list(recipeId) {
    const res = await http.get("/recipe-ingredients", { params: { recipeId } });
    return unwrap(res);
  },

  async add(input) {
    const res = await http.post("/recipe-ingredients", input);
    return unwrap(res);
  },

  async update(id, input) {
    const res = await http.patch(`/recipe-ingredients/${id}`, input);
    return unwrap(res);
  },

  async remove(id) {
    const res = await http.delete(`/recipe-ingredients/${id}`);
    return unwrap(res);
  },
};
