// Object Material
var objectMaterial = new THREE.MeshPhongMaterial({color:"rgb(255,0,0)"});
  objectMaterial.side =  THREE.DoubleSide; // Show front and back polygons

//----------------------------------
// Create Lathe Geometry
//----------------------------------
// First, create the point vector to be used by the Lathe algorithm
var points = generatePoints();
// Set the main properties of the surface
var segments = 20;
var phiStart = 0;
var phiLength = 2 * Math.PI;
var latheGeometry = new THREE.LatheGeometry(points, segments, phiStart, phiLength);
var object = new THREE.Mesh(latheGeometry, objectMaterial);
  object.castShadow = true;
scene.add(object);

render();

function generatePoints()
{
  var points = [];
  var numberOfPoints = 12;
  for (var i = 0; i < numberOfPoints; i++) {
    points.push(new THREE.Vector2(Math.sin(i*2 / 4.17)+3, i));
  }
  points.push(new THREE.Vector2(0, 0));
  // material for all points
  var material = new THREE.MeshPhongMaterial({color:"rgb(255,255,0)"});

  spGroup = new THREE.Object3D();
  points.forEach(function (point) {
    var spGeom = new THREE.SphereGeometry(0.2);
    var spMesh = new THREE.Mesh(spGeom, material);
    spMesh.position.set(point.x, point.y, 0);
    spGroup.add(spMesh);
  });
  // add the points as a group to the scene
  scene.add(spGroup);
  return points;
}