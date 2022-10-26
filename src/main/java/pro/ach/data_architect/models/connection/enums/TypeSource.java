package pro.ach.data_architect.models.connection.enums;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

public enum TypeSource {
   FILES("Файлы"), DB("База данных");
  // , ANY_FILES("Неструктурированные файлы");

  private String title;

  // ----------------------------------------------------------------------------------------------
  TypeSource(String title) {
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
  public static List<TypeSource> asList() {
    ArrayList<TypeSource> list = new ArrayList<TypeSource>();

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
    return "TypeSource{" + "title='" + title + '\'' + '}';
  }
}
