# Filter 필터 <Badge type="tip" text="^1.0.0" /> <Badge type="warning" text="Beta" />

Filter는 내장된 열 헤더 필터 컴포넌트입니다. 열 헤더의 필터 아이콘을 클릭하면 필터 패널이 열리며, 수동으로 옵션을 지정하거나 데이터에서 자동으로 옵션을 추출하는 것을 지원합니다.

### 기본 사용법

`createFilterCell` 팩토리 함수로 Filter 컴포넌트를 생성하고 `customHeaderCell`로 사용합니다.

<demo vue="advanced/custom-cells/FilterCell/index.vue" github="https://github.com/ja-plus/stk-table-vue/tree/master/docs-demo/advanced/custom-cells/FilterCell/index.vue"></demo>

### 옵션 자동 추출

`autoOptions: true`를 설정하면, Filter가 현재 열의 데이터에서 중복을 제거한 값을 자동으로 추출하여 필터 옵션으로 사용합니다.

```ts
{
    title: t('city'),
    dataIndex: 'city',
    customHeaderCell: Filter({
        autoOptions: true, // 데이터에서 자동으로 옵션 추출
    }),
}
```

::: tip 한계점
* `autoOptions`는 소량 데이터에서 개발 편의성을 위해 사용됩니다. **대량 데이터**의 경우 전체 순회가 필요하여 성능 문제가 발생할 수 있습니다.
* 옵션 순서가 고정되지 않습니다.
:::

::: warning autoOptions 캐시 갱신 시점
`autoOptions`는 추출 결과를 캐시합니다. `props.dataSource` 참조가 변경되면 (예: `sort-remote` 시나리오에서 부모 컴포넌트가 필터링된 데이터를 `dataSource`로 다시 전달하는 경우), 캐시가 초기화되고 다음에 드롭다운을 열 때 새로운 데이터에서 옵션이 재추출되어 옵션이 줄어들 수 있습니다. 옵션을 안정적으로 유지하려면 `options`로 고정 옵션 목록을 수동 지정하세요.
:::

### 필터 로직 커스터마이징

`filter` 매개변수를 통해 필터 로직을 커스터마이징할 수 있습니다:

```ts
{
    title: t('age'),
    dataIndex: 'age',
    customHeaderCell: Filter({
        options: [
            { label: '30세 미만', value: 'young' },
            { label: '30세 이상', value: 'old' },
        ],
        filter: ({ row, cellValue, filterValues }) => {
            return filterValues.some(v => {
                if (v === 'young') return cellValue < 30;
                if (v === 'old') return cellValue >= 30;
                return false;
            });
        },
    }),
}
```

<demo vue="advanced/custom-cells/FilterCell/CustomFilter.vue" github="https://github.com/ja-plus/stk-table-vue/tree/master/docs-demo/advanced/custom-cells/FilterCell/CustomFilter.vue"></demo>

### createFilterCell 옵션

`createFilterCell` 팩토리 함수는 설정 객체를 받습니다:

```ts
interface CreateFilterCellOption {
    /** 원격 필터링 사용 여부, 기본값 false */
    remote?: boolean;
    /** 필터 상태 변경 시 트리거됩니다 */
    onChange?: (data: { colKey: UniqKey; status: FilterStatus }) => void;
}
```

| 속성 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| remote | `boolean` | `false` | 원격 필터링 사용 여부, true 설정 시 자동 데이터 필터링이 트리거되지 않습니다 |
| onChange | `(data) => void` | - | 필터 상태 변경 시 콜백, 매개변수에 `colKey`(열 키)와 `status`(현재 열 필터 상태)가 포함됩니다 |

### 설정 옵션

`FilterComponent`는 설정 객체를 받습니다:

```ts
interface FilterComponentConfig {
    options?: FilterOption[];       // 필터 옵션 목록
    filter?: (args) => boolean;     // 커스텀 필터 함수
    autoOptions?: boolean;          // 데이터에서 자동으로 옵션 추출 여부, 기본값 false
}

interface FilterOption {
    label: string;     // 표시 텍스트
    value: any;        // 필터 값
    selected?: boolean; // 기본 선택 여부
}
```

### FilterStatus 타입

```ts
interface FilterStatus {
    /** 현재 선택된 필터 값 배열 */
    value: any[];
    /** 커스텀 필터 로직 함수 */
    filter?: (args: { row: any; cellValue: any; filterValues: any[] }) => boolean;
}
```

## 원격 정렬 충돌 주의

`sort-remote` 원격 정렬 모드에서 `@sort-change` 이벤트의 세 번째 매개변수 `data`는 테이블의 현재 작업 데이터 복사본입니다. **만약 활성화된 필터 조건이 있다면, 이 데이터는 필터링된 행만 포함하며**, 원본 `props.dataSource` 전체가 아닙니다.

만약 이 `data`를 직접 `dataSource`에 할당하면, 필터링된 행이 **영구적으로 손실**됩니다.

::: warning 올바른 방법
원격 정렬 시, 부모 컴포넌트는 항상 자신이 관리하는 **원본 데이터 소스**를 기반으로 정렬해야 하며, `sort-change` 이벤트의 `data` 매개변수를 사용하면 안 됩니다.
```ts
// ✘ 잘못된 방법: data는 이미 필터링되었을 수 있어, 직접 할당 시 데이터가 손실됩니다
function handleSortChange(col, order, data) {
    dataSource.value = data;
}

// ✔ 올바른 방법: 원본 데이터 소스를 기반으로 정렬
function handleSortChange(col, order) {
    // originalData = dataSource.value
    dataSource.value = sortMyData(originalData, col, order);
}
```
:::
