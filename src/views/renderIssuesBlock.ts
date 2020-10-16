import { ident } from './ident';
import { renderIssue } from './renderIssue';

import { IWrappedIssue } from '../interfaces/IWrappedIssue';

const renderTitle = (title: string) => {
    return `- **${title}**`;
}

const renderIssuesList = (issues: IWrappedIssue[]) => {
    const items = [];

    for (let wrappedIssue of issues) {
        const { column, issue } = wrappedIssue;
        const item = renderIssue(column, issue);
        items.push(`${ident(1)}${item}`);
    }

    return items.join('\n');
}

export const renderIssuesBlock = (title: string, issues: IWrappedIssue[], isRenderEmpty = true) => {
    if (!isRenderEmpty && !issues.length) {
        return undefined;
    }

    return [
        renderTitle(title),
        renderIssuesList(issues),
    ].join('\n');
}
