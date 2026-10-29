package SmartRecipeSystem.backend;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.*;

public class RecipeController {

    // Database Credentials - Update password to match your MySQL password
    private static final String DB_URL = "jdbc:mysql://localhost:3306/smart_recipes_db";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "root";

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        // Register REST API Endpoints
        server.createContext("/api/recipes/smart-match/", new SmartMatchHandler());
        server.createContext("/api/pantry/", new PantryHandler());
        server.createContext("/api/pantry/toggle", new PantryToggleHandler());

        server.setExecutor(null);
        System.out.println("====================================================");
        System.out.println("Smart Recipe Java Backend started on port 8080");
        System.out.println("Endpoint: http://localhost:8080/api/recipes/smart-match/1");
        System.out.println("====================================================");
        server.start();
    }

    private static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
    }

    // Helper: Add CORS headers so HTML/JS frontend can call the Java server
    private static void addCorsHeaders(HttpExchange exchange) {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
    }

    private static void sendJson(HttpExchange exchange, int statusCode, String json) throws IOException {
        addCorsHeaders(exchange);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\r", "")
                   .replace("\n", "\\n");
    }

    // 1. GET /api/recipes/smart-match/{userId}
    static class SmartMatchHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 204, "");
                return;
            }

            String path = exchange.getRequestURI().getPath();
            String[] segments = path.split("/");
            int userId = 1;
            try {
                userId = Integer.parseInt(segments[segments.length - 1]);
            } catch (NumberFormatException ignored) {}

            List<Map<String, Object>> recipesList = new ArrayList<>();

            try (Connection conn = getConnection()) {
                // Step A: Load user's pantry items from SQL
                Set<String> userPantry = new HashSet<>();
                try (PreparedStatement psPantry = conn.prepareStatement(
                        "SELECT LOWER(ingredient_name) FROM user_pantry WHERE user_id = ?")) {
                    psPantry.setInt(1, userId);
                    try (ResultSet rs = psPantry.executeQuery()) {
                        while (rs.next()) {
                            userPantry.add(rs.getString(1));
                        }
                    }
                }

                // Step B: Load all recipes and compare ingredients
                try (Statement stmt = conn.createStatement();
                     ResultSet rsRecipes = stmt.executeQuery("SELECT * FROM recipes")) {

                    while (rsRecipes.next()) {
                        int recipeId = rsRecipes.getInt("id");
                        Map<String, Object> recipe = new HashMap<>();
                        recipe.put("id", recipeId);
                        recipe.put("name", rsRecipes.getString("name"));
                        recipe.put("time", rsRecipes.getString("cook_time"));
                        recipe.put("calories", rsRecipes.getString("calories"));
                        recipe.put("img", rsRecipes.getString("img"));
                        recipe.put("videoUrl", rsRecipes.getString("video_url"));
                        recipe.put("instructions", rsRecipes.getString("instructions"));

                        List<String> allIngredients = new ArrayList<>();
                        List<String> missingIngredients = new ArrayList<>();
                        int haveCount = 0;

                        try (PreparedStatement psIng = conn.prepareStatement(
                                "SELECT ingredient_name FROM recipe_ingredients WHERE recipe_id = ?")) {
                            psIng.setInt(1, recipeId);
                            try (ResultSet rsIng = psIng.executeQuery()) {
                                while (rsIng.next()) {
                                    String ing = rsIng.getString("ingredient_name");
                                    allIngredients.add(ing);
                                    if (userPantry.contains(ing.toLowerCase())) {
                                        haveCount++;
                                    } else {
                                        missingIngredients.add(ing);
                                    }
                                }
                            }
                        }

                        int totalCount = allIngredients.size();
                        int matchPercent = totalCount > 0 ? Math.round((haveCount * 100.0f) / totalCount) : 100;

                        recipe.put("haveCount", haveCount);
                        recipe.put("totalCount", totalCount);
                        recipe.put("matchPercent", matchPercent);
                        recipe.put("ready", missingIngredients.isEmpty());
                        recipe.put("missingIngredients", missingIngredients);
                        recipe.put("ingredients", allIngredients);

                        recipesList.add(recipe);
                    }
                }

                // Sort by highest inventory match percentage
                recipesList.sort((a, b) -> Integer.compare((int) b.get("matchPercent"), (int) a.get("matchPercent")));

                // Build JSON response
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < recipesList.size(); i++) {
                    Map<String, Object> r = recipesList.get(i);
                    if (i > 0) json.append(",");
                    json.append("{")
                        .append("\"id\":").append(r.get("id")).append(",")
                        .append("\"name\":\"").append(escapeJson((String) r.get("name"))).append("\",")
                        .append("\"time\":\"").append(escapeJson((String) r.get("time"))).append("\",")
                        .append("\"calories\":\"").append(escapeJson((String) r.get("calories"))).append("\",")
                        .append("\"img\":\"").append(escapeJson((String) r.get("img"))).append("\",")
                        .append("\"videoUrl\":\"").append(escapeJson((String) r.get("videoUrl"))).append("\",")
                        .append("\"instructions\":\"").append(escapeJson((String) r.get("instructions"))).append("\",")
                        .append("\"haveCount\":").append(r.get("haveCount")).append(",")
                        .append("\"totalCount\":").append(r.get("totalCount")).append(",")
                        .append("\"matchPercent\":").append(r.get("matchPercent")).append(",")
                        .append("\"ready\":").append(r.get("ready")).append(",")
                        .append("\"missingIngredients\":").append(listToJsonArray((List<String>) r.get("missingIngredients"))).append(",")
                        .append("\"ingredients\":").append(listToJsonArray((List<String>) r.get("ingredients")))
                        .append("}");
                }
                json.append("]");

                sendJson(exchange, 200, json.toString());

            } catch (SQLException e) {
                e.printStackTrace();
                sendJson(exchange, 500, "{\"error\":\"Database connection failed\"}");
            }
        }
    }

    // 2. GET /api/pantry/{userId}
    static class PantryHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 204, "");
                return;
            }

            List<String> pantry = new ArrayList<>();
            try (Connection conn = getConnection();
                 PreparedStatement ps = conn.prepareStatement("SELECT ingredient_name FROM user_pantry WHERE user_id = 1");
                 ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    pantry.add(rs.getString("ingredient_name"));
                }
                sendJson(exchange, 200, listToJsonArray(pantry));
            } catch (SQLException e) {
                e.printStackTrace();
                sendJson(exchange, 500, "[]");
            }
        }
    }

    // 3. POST /api/pantry/toggle
    static class PantryToggleHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 204, "");
                return;
            }

            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            String ingredient = extractJsonValue(body, "ingredient");
            boolean added = false;

            if (ingredient != null && !ingredient.isEmpty()) {
                try (Connection conn = getConnection()) {
                    try (PreparedStatement check = conn.prepareStatement(
                            "SELECT id FROM user_pantry WHERE user_id = 1 AND LOWER(ingredient_name) = LOWER(?)")) {
                        check.setString(1, ingredient);
                        try (ResultSet rs = check.executeQuery()) {
                            if (rs.next()) {
                                try (PreparedStatement del = conn.prepareStatement("DELETE FROM user_pantry WHERE id = ?")) {
                                    del.setInt(1, rs.getInt("id"));
                                    del.executeUpdate();
                                }
                            } else {
                                try (PreparedStatement ins = conn.prepareStatement(
                                        "INSERT INTO user_pantry (user_id, ingredient_name) VALUES (1, ?)")) {
                                    ins.setString(1, ingredient);
                                    ins.executeUpdate();
                                    added = true;
                                }
                            }
                        }
                    }
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
            sendJson(exchange, 200, "{\"inPantry\":" + added + "}");
        }
    }

    private static String listToJsonArray(List<String> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escapeJson(list.get(i))).append("\"");
        }
        sb.append("]");
        return sb.toString();
    }

    private static String extractJsonValue(String json, String key) {
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx == -1) return null;
        int colon = json.indexOf(":", idx);
        int firstQuote = json.indexOf("\"", colon + 1);
        int secondQuote = json.indexOf("\"", firstQuote + 1);
        if (firstQuote != -1 && secondQuote != -1) {
            return json.substring(firstQuote + 1, secondQuote);
        }
        return null;
    }
}