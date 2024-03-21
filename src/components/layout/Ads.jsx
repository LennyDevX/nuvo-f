import React from 'react';
import 'bulma/css/bulma.css';

const BannerComponent = () => {
    return(
        <React.Fragment>

          {/* Simple, rectángulo completo */}
          <div className="section has-background-light has-text-centered">
            <p className="is-size-4">¡Acceso temprano a la minería de NFT! Regístrese ahora y reciba beneficios adicionales.</p>
          </div>

        </React.Fragment>
    );
}

export default BannerComponent;