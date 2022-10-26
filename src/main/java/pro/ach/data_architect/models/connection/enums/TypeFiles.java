package pro.ach.data_architect.models.connection.enums;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

public enum TypeFiles {
  UNDEFINED("Не отпределен"),
  CSV("Текстовые файты с разделителями формата 'csv'");
  // , EXCEL("Файлы формата Microsoft Excel - ['xls', 'xlsx']"),
  // XML("XML структуры"), JSON("JSON структуры"), WORD("Файлы формата Microsoft Word - 'doc', 'docx'"),
  // PDF("Файлы формата Adobe Acrobat - 'pdf'"), TXT("Текстовые файлы формата 'txt'"),
  // PICTURES("Файлы растровой графики - 'jpg', 'jpeg', 'tiff', 'tif', 'png'"),
  // RTF("Файлы формата Rich Text Format - 'rtf'"), OPEN("Файлы формата Open Document - 'odt', 'ods'");

  private String title;

  // ----------------------------------------------------------------------------------------------
  TypeFiles(String title) {
    this.title = title;
  }

  // ----------------------------------------------------------------------------------------------
  public String getTitle() {
    return title;
  }

  // ----------------------------------------------------------------------------------------------
  /**
   * Возвращает все значения enum в виде массива
   * 
   * @return Возвращает массив всех знаений перечисления в виде:
   * 
   *         <code>name</code> - значение перечисления, <code>ordinal</code> -
   *         номер по порядку, <code>title</code> - название значения перечисления
   */
  public static List<TypeFiles> asList() {
    ArrayList<TypeFiles> list = new ArrayList<TypeFiles>();

    Collections.addAll(list, values());

    return list;
  }

  // ----------------------------------------------------------------------------------------------
  /**
   * Возвращает все значения enum в виде Map ключ + значение
   * 
   * @return Возвращает Map всех знаений перечисления в виде:
   * 
   *         <code>ключ</code> - код перечисления, <code>значение</code> -
   *         название перечисления
   */
  public static HashMap<String, String> asMap() {
    HashMap<String, String> map = new HashMap<String, String>();

    asList().forEach(one -> {
      map.put(one.name(), one.title);
    });

    return map;
  }

  // ----------------------------------------------------------------------------------------------
  @Override
  public String toString() {
    return "TypeFiles{" + "title='" + title + '\'' + '}';
  }
}
