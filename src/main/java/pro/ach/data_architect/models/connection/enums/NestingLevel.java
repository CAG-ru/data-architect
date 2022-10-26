package pro.ach.data_architect.models.connection.enums;

public enum NestingLevel {
    DATABASE {
        int value = 1;

        public int getValue() {
            return value;
        }
    },
    TABLE {
        int value = 2;

        public int getValue() {
            return value;
        }
    },
    COLUMN {
        int value = 3;

        public int getValue() {
            return value;
        }
    };

    public abstract int getValue();
}
