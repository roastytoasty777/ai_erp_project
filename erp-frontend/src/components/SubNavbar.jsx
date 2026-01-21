import React from 'react';

const SubNavbar = ({ links }) => {
    return (
        <div className="sub-navbar" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            padding: '10px 0',
            background: 'rgba(30, 41, 59, 0.5)',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
            {links.map((link, index) => (
                <a 
                    key={index} 
                    href={link.href}
                    style={{
                        color: '#94a3b8',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        padding: '5px 10px',
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.color = '#fff'}
                    onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                >
                    {link.label}
                </a>
            ))}
        </div>
    );
};

export default SubNavbar;
