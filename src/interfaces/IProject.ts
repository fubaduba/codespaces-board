export interface IProject {
  /**
   * Project id.
   *
   * @TJS-type integer
   */
  id: number;

  /**
   * Issue labels that will be rendered as sections
   * on the aggregated issue. With descending priority.
   *
   * Example: ["port-forwarding", "workbench", "performance", "serverless"]
   *
   * The issues with both "port-forwarding" and "performance" labels, will
   * show up only in the` Port-forwarding` section since it has the higher
   * precedence over the "performance" label.
   */
  trackLabels?: string[];

  /**
   * List of mutually exclusive[1] priority labels with descending priority[2].
   * Example: ["p0", "p1", "p2", "p3"]
   * - [1]: No `p0` and `p1` can be assigned at the same time.
   * - [2]: Label in [N-th] array position has higher precendence then
   *        any item in the rest of the list. `p1` has higher priority
   *        than `p3` in the example above.
   *
   * These labels will be rendered as a label on the list items
   * to signify the priority of the item.
   */
  priorityLabels?: string[];

  /**
   * If to render issues as check list using the [x] markers.
   *
   * default: false
   */
  isCheckListItems?: boolean;

  /**
   * Team developers list, if not set, inferred from
   * the assigned GitHub issues.
   */
  developers?: string[];

  /**
   * How many days should elapse since the beginning of
   * the sprint for a card to be treated as `new`.
   */
  newCardsCutoffDays?: number;

  /**
   * The issue that is used as aggregated board.
   */
  boardComment?: string;
}
