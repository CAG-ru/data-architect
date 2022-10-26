package pro.ach.data_architect.models.relation.enums;

public enum RelationType {
    MANUAL {
        @Override
        public String toString() {
            return "Manual";
        }
    }, AUTO {
        @Override
        public String toString() {
            return "auto";
        }
    }, FOREIGN {
        @Override
        public String toString() {
            return "Foreign";
        }
    };

    public abstract String toString();
}
