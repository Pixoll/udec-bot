"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateQueryBuilder = exports.InsertQueryBuilder = exports.SelectQueryBuilder = exports.QueryBuilder = void 0;
class QueryBuilder {
    instruction;
    table;
    constructor(instruction, table) {
        this.instruction = instruction;
        this.table = table;
    }
}
exports.QueryBuilder = QueryBuilder;
class SelectQueryBuilder extends QueryBuilder {
    columns;
    filters;
    constructor(table) {
        super('SELECT', table);
        this.columns = new Set();
        this.filters = [];
    }
    select(...columns) {
        for (const column of columns) {
            this.columns.add(column);
        }
        return this;
    }
    where(filter) {
        this.filters.push(filter);
        return this;
    }
    toString() {
        const columns = this.columns.size > 0 ? [...this.columns].join(', ') : '*';
        const where = this.filters.length > 0
            ? 'WHERE ' + this.filters.map(s => {
                const isNull = s.isNull ? 'IS NULL' : null;
                const equality = s.equals ? `= ${parseQueryValue(s.equals)}`
                    : s.notEquals ? `!= ${parseQueryValue(s.notEquals)}`
                        : null;
                const lessComp = s.lessThan ? `< ${s.lessThan}`
                    : s.lessThanOrEqualTo ? `<= ${s.lessThanOrEqualTo}`
                        : null;
                const greaterComp = s.greaterThan ? `> ${s.greaterThan}`
                    : s.greaterThanOrEqualTo ? `>= ${s.greaterThanOrEqualTo}`
                        : null;
                const filters = [isNull, equality, lessComp, greaterComp].filter(f => f);
                if (filters.length === 0) {
                    throw new Error('Must specify at least one query filter.');
                }
                return `(${s.column} ${filters.join(` OR ${s.column} `)})`;
            }).join(' AND ')
            : '';
        return `${this.instruction} ${columns} FROM ${this.table.name} ${where};`.replace(/ ;$/, ';');
    }
}
exports.SelectQueryBuilder = SelectQueryBuilder;
class InsertQueryBuilder extends QueryBuilder {
    cols;
    vals;
    constructor(table) {
        super('INSERT INTO', table);
        this.cols = new Set();
        this.vals = [];
    }
    columns(...columns) {
        for (const column of columns) {
            this.cols.add(column);
        }
        return this;
    }
    values(...values) {
        this.vals.push(...values);
        return this;
    }
    toString() {
        const columns = [...this.cols];
        const values = this.vals.map(parseQueryValue);
        if (columns.length === 0) {
            throw new Error('At least one column must be specified.');
        }
        if (columns.length !== values.length) {
            throw new Error('Amount of values must equal amount of columns.');
        }
        return `${this.instruction} ${this.table.name} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
    }
}
exports.InsertQueryBuilder = InsertQueryBuilder;
class UpdateQueryBuilder extends QueryBuilder {
    constructor(table) {
        super('UPDATE', table);
    }
    toString() {
        return '';
    }
}
exports.UpdateQueryBuilder = UpdateQueryBuilder;
function parseQueryValue(value) {
    switch (typeof value) {
        case 'string':
            return `"${value.replace(/"/g, '\\"')}"`;
        case 'bigint':
            return value.toString().replace('n', '');
        default:
            return `${value}`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9kYi9xdWVyeUJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBc0IsWUFBWTtJQUNYLFdBQVcsQ0FBUztJQUNwQixLQUFLLENBQVE7SUFFaEMsWUFBbUIsV0FBbUIsRUFBRSxLQUFZO1FBQ2hELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7Q0FHSjtBQVZELG9DQVVDO0FBb0JELE1BQWEsa0JBR1gsU0FBUSxZQUFtQjtJQUNSLE9BQU8sQ0FBOEI7SUFDckMsT0FBTyxDQUE2QztJQUVyRSxZQUFtQixLQUFZO1FBQzNCLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQ3RCLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBRyxPQUFrQjtRQUMvQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUF5QixNQUEwQztRQUMzRSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUF3RCxDQUFDLENBQUM7UUFDNUUsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLFFBQVE7UUFDWCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFB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