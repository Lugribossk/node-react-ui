import React from "react";

type Props = {
    glyph: string;
    style?: React.CSSProperties;
};

const Glyph: React.FunctionComponent<Props> = ({glyph}) => (
    <span className={`glyph glyph-${glyph}`} aria-hidden="true"></span>
);
export default Glyph;
