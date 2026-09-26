# dsh-system-prompt 文档入口

`dsh-system-prompt` 只提供 live session 级的系统提示词检查。

## 当前文档

- [README](../README.md)：安装、构建和 provenance 边界
- [InspectionView](inspection-view.md)：System Prompt（系统提示词）tab 的功能设计与实现
- [Trajectory detail tab](trajectory-detail-tab.md)：Sections tab 的功能设计与实现
- [轨迹 Sections bridge](trajectory-section-detail-tab.md)：DOM 契约、生命周期和数据流

## 发布前检查

```sh
npm test
npm run build
npm pack --dry-run --json
```
