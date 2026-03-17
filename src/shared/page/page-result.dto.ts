export class PageResultDto<T> {
    constructor(
        public readonly total: number,
        public readonly pageNum: number,
        public readonly pageSize: number,
        public readonly records: T[],
    ) {}
}
