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
    selectors;
    constructor(table) {
        super('SELECT', table);
        this.columns = new Set();
        this.selectors = [];
    }
    select(...columns) {
        for (const column of columns) {
            this.columns.add(column);
        }
        return this;
    }
    where(selector) {
        this.selectors.push(selector);
        return this;
    }
    toString() {
        const columns = this.columns.size > 0 ? [...this.columns].join(', ') : '*';
        const where = this.selectors.length > 0
            ? 'WHERE ' + this.selectors.map(s => {
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
                return `(${s.column} ${filters.join(' OR ')})`;
            }).join(' AND ')
            : '';
        return `${this.instruction} ${columns} FROM ${this.table.name} ${where};`;
    }
}
exports.SelectQueryBuilder = SelectQueryBuilder;
class InsertQueryBuilder extends QueryBuilder {
    constructor(table) {
        super('INSERT INTO', table);
    }
}
exports.InsertQueryBuilder = InsertQueryBuilder;
class UpdateQueryBuilder extends QueryBuilder {
    constructor(table) {
        super('UPDATE', table);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXVlcnlCdWlsZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9kYi9xdWVyeUJ1aWxkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBR0EsTUFBc0IsWUFBWTtJQUNYLFdBQVcsQ0FBUztJQUNwQixLQUFLLENBQVE7SUFFaEMsWUFBbUIsV0FBbUIsRUFBRSxLQUFZO1FBQ2hELElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSjtBQVJELG9DQVFDO0FBa0JELE1BQWEsa0JBR1gsU0FBUSxZQUFtQjtJQUNSLE9BQU8sQ0FBOEI7SUFDckMsU0FBUyxDQUE2QztJQUV2RSxZQUFtQixLQUFZO1FBQzNCLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBRyxPQUFrQjtRQUMvQixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sRUFBRSxDQUFDO1lBQzNCLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sS0FBSyxDQUF5QixRQUE0QztRQUM3RSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUEwRCxDQUFDLENBQUM7UUFDaEYsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVlLFFBQVE7UUFDcEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElB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