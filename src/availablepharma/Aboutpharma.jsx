import React from 'react';
import '../pharmacies/about.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import medicalImage from '../assets/images/medical.png';
import people from '../assets/images/people.png';
import healthcare from '../assets/images/healthcare.png';
// Import approach: If you have local images in your project
//import medicalImage from './images/medical.png';
//import peopleImage from './images/people.png';
 //import healthcareImage from './images/healthcare.png';

function Aboutpharma() {
  // State to track image loading errors
  const [imageErrors, setImageErrors] = React.useState({
    image1: false,
    image2: false,
    image3: false
  });

  // Handle image loading errors
  const handleImageError = (imageName) => {
    console.log(`${imageName} failed to load.`);
    setImageErrors(prev => ({
      ...prev,
      [imageName]: true
    }));
  };
  

  return (
    <div>
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.1/css/all.min.css" 
        integrity="sha256-2XFplPlrFClt0bIdPgpz8H7ojnk10H69xRqd9+uTShA=" 
        crossOrigin="anonymous" 
      />
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-6 order-2 order-md-1 mt-4 pt-2 mt-sm-0 opt-sm-0">
            <div className="row align-items-center">
              <div className="col-lg-6 col-md-6 col-6">
                <div className="row">
                  <div className="col-lg-12 col-md-12 mt-4 pt-2">
                    <div className="card work-desk rounded border-0 shadow-lg overflow-hidden">
                      {/* SOLUTION 1: Public folder approach */}
                      {!imageErrors.image1 ? (
                        <img 
                         
                  src={people} 
                          className="img-fluid" 
                          alt="Medical supplies" 
                          onError={() => handleImageError('image1')}
                          style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        // Fallback to a colored div if image fails
                        <div 
                          style={{ 
                            height: '200px', 
                            background: '#e9ecef', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          <span>Medical Image</span>
                        </div>
                      )}
                      
                    </div>
                  </div>

                 
                </div>
              </div>

              <div className="col-lg-6 col-md-6 col-6">
                <div className="row">
                  <div className="col-lg-12 col-md-12">
                    <div className="card work-desk rounded border-0 shadow-lg overflow-hidden">
                      {/* SOLUTION 2: Direct URL to reliable source */}
                      {!imageErrors.image2 ? (
                        <img 
                           src={medicalImage} alt="Medical Image"
                         
                          className="img-fluid" 
                        
                          onError={() => handleImageError('image2')}
                          style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          style={{ 
                            height: '200px', 
                            background: '#e9ecef', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}
                        >
                          <span>People Image</span>
                        </div>
                      )}
                    
                    </div>
                  </div>

                  <div className="col-lg-12 col-md-12 mt-4 pt-2">
                    <div className="card work-desk rounded border-0 shadow-lg overflow-hidden">
                      {/* SOLUTION 3: Base64 encoded image (small example) */}
                      <img 
                         src={healthcare} 
                        className="img-fluid" 
                        alt="Healthcare data" 
                        style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                      />
                     
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6 col-md-6 col-12 order-1 order-md-2">
            <div className="section-title ml-lg-5">
              <h1 className="text-custom font-weight-normal mb-3">About Us</h1>
              <h4 className="title mb-4">
                Our mission is to <br />
                make your life easier.
              </h4>
              <p className="text-muted mb-0">
              Welcome to our Pharmacy Platform, where healthcare meets convenience. Our mission is to simplify access to essential medications, medical information, and professional support.

With a focus on trust, reliability, and innovation, we provide a seamless experience for both customers and healthcare providers. Whether you need prescriptions, medical data, or expert guidance, our platform ensures a smooth and efficient process.

Because your health matters, we are here to make it easier.
              </p>

              <div className="row">
                <div className="col-lg-6 mt-4 pt-2">
                  <div className="media align-items-center rounded shadow p-3">
                    <i className="fa fa-play h4 mb-0 text-custom"></i>
                    <h6 className="ml-3 mb-0">
                      <a href="#!" className="text-dark">Responsive</a>
                    </h6>
                  </div>
                </div>
                <div className="col-lg-6 mt-4 pt-2">
                  <div className="media align-items-center rounded shadow p-3">
                    <i className="fa fa-file-download h4 mb-0 text-custom"></i>
                    <h6 className="ml-3 mb-0">
                      <a href="#!" className="text-dark">Free Download</a>
                    </h6>
                  </div>
                </div>
                <div className="col-lg-6 mt-4 pt-2">
                  <div className="media align-items-center rounded shadow p-3">
                    <i className="fa fa-user h4 mb-0 text-custom"></i>
                    <h6 className="ml-3 mb-0">
                      <a href="#!" className="text-dark">Support</a>
                    </h6>
                  </div>
                </div>
                <div className="col-lg-6 mt-4 pt-2">
                  <div className="media align-items-center rounded shadow p-3">
                    <i className="fa fa-image h4 mb-0 text-custom"></i>
                    <h6 className="ml-3 mb-0">
                      <a href="#!" className="text-dark">Development</a>
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Aboutpharma;