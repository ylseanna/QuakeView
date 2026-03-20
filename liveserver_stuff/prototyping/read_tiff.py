import numpy as np
import pyvista as pv
import rioxarray as riox
import vtk
# import delatin
import quantized_mesh_encoder
from pydelatin import Delatin
from pydelatin.util import rescale_positions
from rasterio.plot import reshape_as_raster
import rasterio
from io import BytesIO
import meshio
    
tiff_path = "/home/gab28/DATA/PhD/Data/DEMs/Tinitaly/w45050_s10/w45050_s10_repr.tif"


data = riox.open_rasterio(tiff_path)
x_coords = data["x"].data
y_coords = data["y"].data

mean_x = x_coords.mean()
mean_y = y_coords.mean()

values = data[0].data
factor = 1/(111320*np.cos(np.deg2rad(mean_y)))

values[values==data.rio.nodata] = 0

# values *= factor

mean_z = values.mean()


bounds = [x_coords.min(), y_coords.min(), x_coords.max(), y_coords.max()]
centroid = (mean_x, mean_y, mean_z)

tin = Delatin(values, max_error=5,z_scale=factor)
vertices, triangles = tin.vertices, tin.triangles

# Rescale vertices linearly from pixel units to world coordinates
rescaled_vertices = rescale_positions(vertices, bounds, flip_y=True)

cells = [("triangle", triangles)]
mesh = meshio.Mesh(rescaled_vertices, cells)
# Example output format
# Refer to meshio documentation
mesh.write('foo.vtk')

# data = riox.open_rasterio(tiff_path)
# x_coords = np.asarray(data["x"], np.float32)
# y_coords = np.asarray(data["y"], np.float32)

# bounds = [x_coords.min(), y_coords.min(), x_coords.max(), y_coords.max()]
# center = (np.mean(x_coords), np.mean(y_coords))

# values = np.asarray(data[0], np.float32)
 
# # Create a mesh grid
# x, y = np.asarray(np.meshgrid(data['x'], data['y']), np.float32)
 
# # Set the z values and create a StructuredGrid
# z = np.zeros_like(x, np.float32)
# mesh = pv.StructuredGrid(x, y, z)
 
# # Assign Elevation Values
# mesh["Elevation"] = values.ravel(order='F')
# topo = mesh.warp_by_scalar(scalars="Elevation", factor=0.000015)


# topo_mesh = topo.extract_surface(algorithm=None)
# topo_mesh.translate(np.array(topo_mesh.center)*-1, inplace=True)

# points = topo_mesh.points
# indices = np.delete(topo_mesh.faces, np.arange(0, topo_mesh.faces.size, 4))

# topo_mesh.plot()

# writer = vtk.vtkOBJWriter()

# writer.SetInputData(topo_mesh)

# writer.SetFileName("test.obj")

# writer.Write()


# writerply = vtk.vtkPLYWriter()
# writerply.SetInputData(topo_mesh)
# writerply.SetFileName("test.ply")
# writerply.Write()