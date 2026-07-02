package org.example.hakyfoodbackend.common.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public final class SlugUtil {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTIDASH = Pattern.compile("-{2,}");

    private SlugUtil() {
        // Utility class, prevent instantiation
    }

    /**
     * Chuyển đổi chuỗi tiếng Việt có dấu thành slug chuẩn URL (kebab-case).
     * Ví dụ: "Cơm rang Hawaii" -> "com-rang-hawaii"
     *
     * @param input chuỗi đầu vào (có thể chứa tiếng Việt có dấu)
     * @return slug chuẩn hóa
     */
    public static String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        // Chuyển đổi ký tự đặc biệt tiếng Việt: đ/Đ
        String result = input.replace('đ', 'd').replace('Đ', 'D');

        // Chuẩn hóa Unicode NFD để tách dấu khỏi ký tự gốc
        result = Normalizer.normalize(result, Normalizer.Form.NFD);

        // Loại bỏ các ký tự dấu (combining marks)
        result = result.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // Chuyển sang chữ thường
        result = result.toLowerCase();

        // Thay khoảng trắng bằng dấu gạch ngang
        result = WHITESPACE.matcher(result).replaceAll("-");

        // Loại bỏ ký tự không phải chữ cái, số, hoặc gạch ngang
        result = NONLATIN.matcher(result).replaceAll("");

        // Gộp nhiều dấu gạch ngang liên tiếp thành một
        result = MULTIDASH.matcher(result).replaceAll("-");

        // Xóa dấu gạch ngang ở đầu và cuối
        result = result.replaceAll("^-|-$", "");

        return result;
    }
}
