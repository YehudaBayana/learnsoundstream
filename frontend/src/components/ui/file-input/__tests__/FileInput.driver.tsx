import { fireEvent, render, RenderResult } from '@testing-library/react';
import FileInput, { FileInputVariant } from '../FileInput';
import { getByDataHook, queryByDataHook } from '@/__tests__/testUtils';

export interface FileInputDriverProps {
  dataHook?: string;
  variant?: FileInputVariant;
  buttonText?: string;
  disabled?: boolean;
  error?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFilesChange?: (files: FileList | null) => void;
}

export class FileInputDriver {
  private renderResult: RenderResult | null = null;
  private readonly defaultDataHook = 'test-file-input';

  render(props: FileInputDriverProps = {}): this {
    const dataHook = props.dataHook ?? this.defaultDataHook;
    this.renderResult = render(<FileInput {...props} dataHook={dataHook} />);
    return this;
  }

  private getContainer(): HTMLElement {
    if (!this.renderResult) throw new Error('FileInputDriver: render() must be called before querying');
    return this.renderResult.container;
  }

  exists(dataHook = this.defaultDataHook): boolean {
    return queryByDataHook(this.getContainer(), dataHook) !== null;
  }

  isDisabled(dataHook = this.defaultDataHook): boolean {
    return (getByDataHook(this.getContainer(), `${dataHook}-button`) as HTMLButtonElement).disabled;
  }

  getButtonClassName(dataHook = this.defaultDataHook): string {
    return getByDataHook(this.getContainer(), `${dataHook}-button`).className;
  }

  clickButton(dataHook = this.defaultDataHook): void {
    fireEvent.click(getByDataHook(this.getContainer(), `${dataHook}-button`));
  }

  spyOnInputClick(dataHook = this.defaultDataHook): jest.SpyInstance {
    return jest.spyOn(getByDataHook(this.getContainer(), `${dataHook}-input`), 'click');
  }

  selectFile(fileName = 'track.wav', dataHook = this.defaultDataHook): void {
    const selectedFile = new File(['audio'], fileName, { type: 'audio/wav' });
    fireEvent.change(getByDataHook(this.getContainer(), `${dataHook}-input`), {
      target: { files: [selectedFile] },
    });
  }

  getSelectedFiles(dataHook = this.defaultDataHook): string {
    return queryByDataHook(this.getContainer(), `${dataHook}-selected-files`)?.textContent?.trim() ?? '';
  }
}