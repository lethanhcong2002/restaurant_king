/* eslint-disable react/prop-types */
const Divider = ({ text, color = 'black', thickness = '1px', margin = '16px 0' }) => {
    return (
        <div className="d-flex align-items-center text-center" style={{ margin }}>
            <hr className="flex-grow-1" style={{ borderTop: `${thickness} solid ${color}` }} />
            {text && <span className="px-2" style={{ color }}>{text}</span>}
            <hr className="flex-grow-1" style={{ borderTop: `${thickness} solid ${color}` }} />
        </div>
    );
};

export default Divider;
