# Filter 필터(Beta)

Filter는 내장된 열 헤더 필터 컴포넌트입니다. 열 헤더의 필터 아이콘을 클릭하면 필터 패널이 열리며, 수동으로 옵션을 지정하거나 데이터에서 자동으로 옵션을 추출하는 것을 지원합니다.

### 기본 사용법

`createFilter` 팩토리 함수로 Filter 컴포넌트를 생성하고 `customHeaderCell`로 사용합니다.

<demo vue="advanced/custom-cells/Filter/index.vue" github="https://github.com/ja-plus/stk-table-vue/tree/master/docs-demo/advanced/custom-cells/Filter/index.vue"></demo>

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
            if (filterValues.includes('young')) {
                return cellValue < 30;
            }
            if (filterValues.includes('old')) {
                return cellValue >= 30;
            }
            return true;
        },
    }),
}
```

### 데이터 필터링

Filter 컴포넌트 자체는 데이터를 자동으로 필터링하지 않습니다. `filterStatus` 반응형 객체를 통해 필터 상태를 제공하므로, 데이터 필터링은 직접 처리해야 합니다:

```ts
import { ref, computed } from 'vue';
import { createFilter } from 'stk-table-vue/src/StkTable/custom-cells/Filter';

const { Filter, filterStatus } = createFilter();

const rawData = ref([...]); // 원본 데이터

// 필터 상태에 따라 데이터 필터링
const dataSource = computed(() => {
    const filters = filterStatus.value;
    const filterKeys = Object.keys(filters);
    if (filterKeys.length === 0) return rawData.value;

    return rawData.value.filter(row => {
        for (const key of filterKeys) {
            const filter = filters[key];
            if (filter.value.length > 0) {
                const cellValue = row[key as keyof typeof row];
                if (filter.filter) {
                    // 커스텀 필터 함수 사용
                    if (!filter.filter({ row, cellValue, filterValues: filter.value })) {
                        return false;
                    }
                } else {
                    // 기본 필터 로직
                    if (!filter.value.includes(cellValue)) {
                        return false;
                    }
                }
            }
        }
        return true;
    });
});
```

### createFilter 옵션

`createFilter` 팩토리 함수는 설정 객체를 받습니다:

```ts
interface CreateFilterOption {
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
