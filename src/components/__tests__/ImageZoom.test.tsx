import { fireEvent, render, screen } from '@testing-library/react';
import { ImageZoom } from '@/components/ImageZoom';

describe('ImageZoom', () => {
  it('opens a zoomed preview when a child image is clicked', () => {
    render(
      <ImageZoom>
        <span
          dangerouslySetInnerHTML={{
            __html:
              '<img alt="small text screenshot" src="/uploads/screenshot.png">',
          }}
        />
      </ImageZoom>
    );

    fireEvent.click(screen.getByAltText('small text screenshot'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByAltText('small text screenshot')).toHaveLength(2);
  });

  it('closes the zoomed preview from the close button', () => {
    render(
      <ImageZoom>
        <span
          dangerouslySetInnerHTML={{
            __html: '<img alt="diagram" src="/uploads/diagram.png">',
          }}
        />
      </ImageZoom>
    );

    fireEvent.click(screen.getByAltText('diagram'));
    fireEvent.click(screen.getByRole('button', { name: '关闭图片预览' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
